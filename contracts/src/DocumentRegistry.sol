// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  DocumentRegistry — Águila Viajera / COPACO
 * @notice Registro append-only e inmutable de excursiones comunitarias y
 *         actas de asistencia para COPACO (Comités de Participación Ciudadana),
 *         Iztapalapa, CDMX.
 *
 * @dev    Solo almacena hashes SHA-256 del contenido; los datos reales
 *         (nombres, fechas, participantes) permanecen off-chain.  Esto
 *         protege la privacidad de los adultos mayores y mantiene los
 *         gas costs al mínimo.
 *
 *         Invariante de integridad: una vez que un registroId es creado,
 *         su contenidoHash, autor y timestamp son inmutables para siempre.
 *         Cualquier modificación off-chain producirá un hash diferente al
 *         registrado, detectando la alteración.
 *
 *         Fase 3 del roadmap — ver PRD §6 y plan-desarrollo.md Fase 3.
 */
contract DocumentRegistry {

    // ─────────────────────────────────────────────────────────────────────────
    // Tipos de datos
    // ─────────────────────────────────────────────────────────────────────────

    struct Registro {
        /// @dev SHA-256 del JSON canónico del documento off-chain (32 bytes)
        bytes32 contenidoHash;
        /// @dev Wallet institucional COPACO que firmó la transacción
        address autor;
        /// @dev block.timestamp al momento del anclaje (segundos Unix)
        uint64  timestamp;
        /// @dev "excursion" | "checkin" | "inscripcion" | "perfil_salud"
        string  tipo;
        /// @dev ID del registro en la base de datos off-chain
        string  referenciaId;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Estado
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice registroId → Registro. Append-only: nunca se borra ni actualiza.
    mapping(bytes32 => Registro) public registros;

    /// @notice Lista completa de registroIds en orden de creación.
    bytes32[] public listaRegistros;

    // ─────────────────────────────────────────────────────────────────────────
    // Eventos
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Emitido cada vez que se ancla un nuevo registro.
     * @param registroId    ID único de este anclaje (keccak256 de los parámetros).
     * @param contenidoHash SHA-256 del documento off-chain.
     * @param autor         Wallet que firmó la transacción.
     * @param timestamp     block.timestamp del anclaje.
     * @param tipo          Tipo de registro ("excursion", "checkin", etc.)
     * @param referenciaId  ID del registro en la base de datos off-chain.
     */
    event RegistroAnclado(
        bytes32 indexed registroId,
        bytes32 indexed contenidoHash,
        address indexed autor,
        uint64          timestamp,
        string          tipo,
        string          referenciaId
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Errores
    // ─────────────────────────────────────────────────────────────────────────

    error RegistroYaExiste(bytes32 registroId);
    error HashVacio();
    error TipoVacio();
    error ReferenciaVacia();

    // ─────────────────────────────────────────────────────────────────────────
    // Funciones principales
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Ancla el hash SHA-256 de un documento en la cadena.
     *         Esta operación es irreversible e inmutable — no hay función de
     *         modificación ni de eliminación.
     *
     * @param contenidoHash  Hash SHA-256 del JSON canónico del documento (bytes32).
     *                       Calcular off-chain con: keccak256(sha256(canonicalJSON(doc))).
     *                       Ver lib/crypto.ts en el frontend para la implementación.
     * @param tipo           Tipo de registro: "excursion", "checkin", "inscripcion".
     * @param referenciaId   ID del registro en la base de datos off-chain (ej. "ex-1001").
     *
     * @return registroId    Identificador único de este anclaje en la cadena.
     *                       Guardar este valor en la base de datos para verificación futura.
     */
    function anclar(
        bytes32        contenidoHash,
        string calldata tipo,
        string calldata referenciaId
    ) external returns (bytes32 registroId) {
        if (contenidoHash == bytes32(0))            revert HashVacio();
        if (bytes(tipo).length == 0)                revert TipoVacio();
        if (bytes(referenciaId).length == 0)        revert ReferenciaVacia();

        // El registroId es determinista: mismos inputs → mismo ID.
        // Si el coordinador llama anclar() dos veces con el mismo documento,
        // la segunda llamada revierte, protegiendo contra duplicados.
        registroId = keccak256(
            abi.encodePacked(contenidoHash, msg.sender, block.timestamp, referenciaId)
        );

        if (registros[registroId].timestamp != 0) {
            revert RegistroYaExiste(registroId);
        }

        registros[registroId] = Registro({
            contenidoHash: contenidoHash,
            autor:         msg.sender,
            timestamp:     uint64(block.timestamp),
            tipo:          tipo,
            referenciaId:  referenciaId
        });

        listaRegistros.push(registroId);

        emit RegistroAnclado(
            registroId,
            contenidoHash,
            msg.sender,
            uint64(block.timestamp),
            tipo,
            referenciaId
        );

        return registroId;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Funciones de verificación (read-only, sin gas para el usuario final)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Verifica si el contenido actual de un documento coincide con
     *         el hash que fue anclado originalmente.
     *
     * @param registroId    ID del registro a verificar (devuelto por anclar()).
     * @param contenidoHash Hash SHA-256 del documento actual (recalculado off-chain).
     *
     * @return integro    true si el documento no ha sido alterado.
     * @return autor      Wallet que ancló el registro.
     * @return timestamp  Timestamp Unix del anclaje.
     */
    function verificar(
        bytes32 registroId,
        bytes32 contenidoHash
    )
        external
        view
        returns (bool integro, address autor, uint64 timestamp)
    {
        Registro storage r = registros[registroId];
        return (r.contenidoHash == contenidoHash, r.autor, r.timestamp);
    }

    /**
     * @notice Devuelve el registro completo por su ID.
     * @param registroId  ID del registro a consultar.
     */
    function obtenerRegistro(bytes32 registroId)
        external
        view
        returns (Registro memory)
    {
        return registros[registroId];
    }

    /**
     * @notice Número total de registros anclados.
     */
    function totalRegistros() external view returns (uint256) {
        return listaRegistros.length;
    }

    /**
     * @notice Devuelve un slice de listaRegistros para paginación.
     * @param offset  Índice de inicio (0-based).
     * @param limite  Número máximo de IDs a devolver.
     */
    function obtenerRegistros(uint256 offset, uint256 limite)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 total = listaRegistros.length;
        if (offset >= total) return new bytes32[](0);

        uint256 fin = offset + limite;
        if (fin > total) fin = total;

        bytes32[] memory resultado = new bytes32[](fin - offset);
        for (uint256 i = offset; i < fin; i++) {
            resultado[i - offset] = listaRegistros[i];
        }
        return resultado;
    }
}

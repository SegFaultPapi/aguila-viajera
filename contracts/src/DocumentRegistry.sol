// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  DocumentRegistry — Águila Viajera / COPACO
 * @notice Registro público e inmutable de actas de excursiones comunitarias
 *         para COPACO (Comités de Participación Ciudadana), Iztapalapa, CDMX.
 *
 * @dev    Guarda datos agregados de cada excursión (destino, colonia, fecha,
 *         número de asistentes, cupo) para que cualquiera pueda verificar en
 *         Etherscan que la excursión ocurrió y cuánta gente asistió — SIN
 *         nombres, teléfonos, datos de salud ni fotografías. Esos datos
 *         nunca tocan la cadena; solo viven en la base de datos off-chain.
 *
 *         Solo una wallet institucional autorizada ("publicador") puede
 *         escribir. Esa wallet vive en el backend (servidor), no en la del
 *         coordinador — el coordinador nunca firma ni conecta una wallet,
 *         solo presiona un botón en la app.
 *
 *         Invariante de integridad: una vez publicada, un acta es inmutable
 *         para siempre. No existen funciones de modificación ni de borrado.
 *
 *         Fase 3 del roadmap — ver PRD §6 y plan-desarrollo.md Fase 3.
 */
contract DocumentRegistry {

    // ─────────────────────────────────────────────────────────────────────────
    // Tipos de datos
    // ─────────────────────────────────────────────────────────────────────────

    struct Acta {
        /// @dev ID de la excursión en la base de datos off-chain (ej. "ex-1001")
        string  excursionId;
        /// @dev Nombre del destino (ej. "Museo Nacional de Antropología")
        string  destino;
        /// @dev Colonia de origen (ej. "San Miguel Teotongo")
        string  colonia;
        /// @dev Fecha de la excursión, Unix timestamp
        uint64  fecha;
        /// @dev Número de personas que asistieron (sin IDs ni nombres)
        uint32  totalAsistentes;
        /// @dev Cupo máximo planeado para la excursión
        uint32  cupoMaximo;
        /// @dev Identificador institucional del coordinador (no un nombre)
        string  coordinadorId;
        /// @dev Huella SHA-256 del acta completa off-chain, para detectar
        ///      alteraciones posteriores en la lista de asistentes. Se calcula
        ///      sobre IDs internos, nunca sobre nombres o datos de salud.
        bytes32 hashVerificacion;
        /// @dev block.timestamp al momento de la publicación
        uint64  publicadoEn;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Estado
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice actaId → Acta. Append-only: nunca se borra ni actualiza.
    mapping(bytes32 => Acta) public actas;

    /// @notice Lista completa de actaIds en orden de publicación.
    bytes32[] public listaActas;

    /// @notice Cuenta institucional (multisig/Safe en producción) que puede rotar al publicador.
    address public owner;

    /// @notice Única wallet autorizada para publicar actas — vive en el backend,
    ///         nunca en el dispositivo del coordinador.
    address public publicador;

    // ─────────────────────────────────────────────────────────────────────────
    // Eventos
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Emitido cada vez que se publica una nueva acta.
     */
    event ActaPublicada(
        bytes32 indexed actaId,
        string  excursionId,
        string  destino,
        uint32  totalAsistentes,
        uint64  publicadoEn
    );

    /// @notice Emitido cuando el owner rota la wallet publicadora (ej. por compromiso de clave).
    event PublicadorActualizado(address indexed anterior, address indexed nuevo);

    // ─────────────────────────────────────────────────────────────────────────
    // Errores
    // ─────────────────────────────────────────────────────────────────────────

    error NoAutorizado();
    error ExcursionIdVacio();
    error ActaYaExiste(bytes32 actaId);

    // ─────────────────────────────────────────────────────────────────────────
    // Modificadores
    // ─────────────────────────────────────────────────────────────────────────

    modifier soloOwner() {
        if (msg.sender != owner) revert NoAutorizado();
        _;
    }

    modifier soloPublicador() {
        if (msg.sender != publicador) revert NoAutorizado();
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param _publicador  Wallet institucional autorizada a publicar actas.
     *                     Si se pasa address(0), el deployer también es el publicador.
     */
    constructor(address _publicador) {
        owner = msg.sender;
        publicador = _publicador == address(0) ? msg.sender : _publicador;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Funciones principales
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Publica el acta de una excursión: destino, colonia, fecha y
     *         cuánta gente asistió. Solo la wallet institucional (publicador)
     *         puede llamar esta función — el coordinador nunca firma.
     *
     * @return actaId  Identificador único de esta acta en la cadena.
     */
    function publicarActa(
        string calldata excursionId,
        string calldata destino,
        string calldata colonia,
        uint64          fecha,
        uint32          totalAsistentes,
        uint32          cupoMaximo,
        string calldata coordinadorId,
        bytes32         hashVerificacion
    ) external soloPublicador returns (bytes32 actaId) {
        if (bytes(excursionId).length == 0) revert ExcursionIdVacio();

        // El actaId es determinista: misma excursión + misma fecha → mismo ID.
        // Publicar dos veces la misma acta revierte, protegiendo contra duplicados.
        actaId = keccak256(abi.encodePacked(excursionId, fecha));

        if (actas[actaId].publicadoEn != 0) {
            revert ActaYaExiste(actaId);
        }

        actas[actaId] = Acta({
            excursionId:      excursionId,
            destino:          destino,
            colonia:          colonia,
            fecha:            fecha,
            totalAsistentes:  totalAsistentes,
            cupoMaximo:       cupoMaximo,
            coordinadorId:    coordinadorId,
            hashVerificacion: hashVerificacion,
            publicadoEn:      uint64(block.timestamp)
        });

        listaActas.push(actaId);

        emit ActaPublicada(actaId, excursionId, destino, totalAsistentes, uint64(block.timestamp));

        return actaId;
    }

    /**
     * @notice Rota la wallet publicadora (ej. si la clave del backend se compromete).
     *         Solo el owner institucional puede hacerlo.
     */
    function cambiarPublicador(address nuevo) external soloOwner {
        emit PublicadorActualizado(publicador, nuevo);
        publicador = nuevo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Funciones de lectura (públicas, sin gas, sin wallet)
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Devuelve el acta completa por su ID.
    function obtenerActa(bytes32 actaId) external view returns (Acta memory) {
        return actas[actaId];
    }

    /// @notice Número total de actas publicadas.
    function totalActas() external view returns (uint256) {
        return listaActas.length;
    }

    /**
     * @notice Devuelve un slice de listaActas para paginación.
     * @param offset  Índice de inicio (0-based).
     * @param limite  Número máximo de IDs a devolver.
     */
    function obtenerActas(uint256 offset, uint256 limite)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 total = listaActas.length;
        if (offset >= total) return new bytes32[](0);

        uint256 fin = offset + limite;
        if (fin > total) fin = total;

        bytes32[] memory resultado = new bytes32[](fin - offset);
        for (uint256 i = offset; i < fin; i++) {
            resultado[i - offset] = listaActas[i];
        }
        return resultado;
    }
}

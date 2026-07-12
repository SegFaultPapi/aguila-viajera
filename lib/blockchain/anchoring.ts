"use client";

/**
 * Servicio de anclaje en Ethereum para Águila Viajera.
 *
 * Flujo de uso (coordinador COPACO):
 *   1. El coordinador cierra el check-in del día de la excursión.
 *   2. El frontend genera el hash SHA-256 del acta (excursión + lista de asistentes).
 *   3. El coordinador conecta su wallet (MetaMask o Privy embedded wallet).
 *   4. Se llama a anclarRegistro() con el hash y metadata.
 *   5. La transacción se envía al contrato DocumentRegistry.
 *   6. Se guarda el txHash y registroId en el store (prototipo) o BD (producción).
 *
 * En producción (Fase 1), el paso 3 será reemplazado por la wallet institucional
 * COPACO (Gnosis Safe multisig) para que ningún coordinador individual tenga
 * control unilateral sobre los registros.
 */

import {
  createWalletClient,
  custom,
  parseEventLogs,
} from "viem";
import { DOCUMENT_REGISTRY_ABI } from "./abi";
import {
  getPublicClient,
  getContractAddress,
  RED_ACTIVA,
  CADENAS,
  type RedBlockchain,
} from "./config";
import { hexToBytes32 } from "../crypto";
import type { AnclajeBlockchain } from "../types";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ParametrosAnclaje {
  /** Hash SHA-256 hex del contenido (generado por lib/crypto.ts) */
  contentHashHex: string;
  /** "excursion" | "checkin" | "inscripcion" */
  tipo: string;
  /** ID del registro en la base de datos off-chain (ej. "ex-1001") */
  referenciaId: string;
  /** Red en la que anclar. Por defecto usa RED_ACTIVA del .env */
  red?: RedBlockchain;
}

export interface ResultadoAnclaje {
  anclaje: AnclajeBlockchain;
  /** URL de Etherscan para compartir / mostrar al coordinador */
  etherscanUrl: string;
}

// ── Función principal de anclaje ──────────────────────────────────────────────

/**
 * Ancla un registro en DocumentRegistry.
 * Requiere que el usuario tenga `window.ethereum` disponible (MetaMask o Privy).
 *
 * @throws Error si no hay wallet conectada, si la red es incorrecta,
 *         o si la tx es rechazada.
 */
export async function anclarRegistro(
  params: ParametrosAnclaje
): Promise<ResultadoAnclaje> {
  const red = params.red ?? RED_ACTIVA;
  const contractAddress = getContractAddress(red);

  if (!contractAddress) {
    throw new Error(
      `No hay dirección de contrato configurada para la red "${red}". ` +
      `Despliega el contrato primero con: cd contracts && npm run deploy:${red}`
    );
  }

  // Verificar que hay wallet disponible
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "No se encontró una wallet Ethereum. " +
      "Instala MetaMask o usa Privy para continuar."
    );
  }

  // Convertir hash hex a bytes32 para el contrato
  const contenidoHashBytes32 = hexToBytes32(params.contentHashHex);

  // Crear wallet client desde el provider del navegador
  // chain: null → viem no valida la cadena al firmar (el contrato verifica en el node)
  const walletClient = createWalletClient({
    chain: CADENAS[red],
    transport: custom(window.ethereum),
  });

  // Solicitar acceso a la cuenta (MetaMask abrirá popup si es necesario)
  const [address] = await walletClient.requestAddresses();

  // Enviar la transacción al contrato
  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: DOCUMENT_REGISTRY_ABI,
    functionName: "anclar",
    args: [contenidoHashBytes32, params.tipo, params.referenciaId],
    account: address,
    chain: CADENAS[red],
  });

  // Esperar confirmación de la tx y extraer registroId del evento
  const publicClient = getPublicClient(red);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let registroId = "0x" + "0".repeat(64) as `0x${string}`;
  let blockTimestamp = Math.floor(Date.now() / 1000);

  // Extraer el registroId del evento RegistroAnclado
  try {
    const logs = parseEventLogs({
      abi: DOCUMENT_REGISTRY_ABI,
      logs: receipt.logs,
      eventName: "RegistroAnclado",
    });
    if (logs.length > 0) {
      registroId = (logs[0] as { args: { registroId: `0x${string}`; timestamp: bigint } }).args.registroId;
      blockTimestamp = Number((logs[0] as { args: { timestamp: bigint } }).args.timestamp);
    }
  } catch {
    // Fallback: el registroId se puede reconstruir off-chain si es necesario
  }

  const { etherscanTxUrl } = await import("./config");
  // localhost no tiene Etherscan — usar Sepolia como fallback para el URL
  const redEtherscan = red === "mainnet" ? "mainnet" : "sepolia";
  const url = etherscanTxUrl(txHash, redEtherscan);

  const anclaje: AnclajeBlockchain = {
    txHash,
    registroId,
    blockNumber: Number(receipt.blockNumber),
    ancladoEn: new Date(blockTimestamp * 1000).toISOString(),
    red: redEtherscan,
  };

  return { anclaje, etherscanUrl: url };
}

// ── Verificación pública (sin wallet, sin gas) ────────────────────────────────

export interface ResultadoVerificacion {
  encontrado: boolean;
  integro: boolean;
  autor: string;
  timestamp: number;
  tipo: string;
  referenciaId: string;
}

/**
 * Verifica si un registro en la cadena coincide con el hash esperado.
 * Esta función es pública — cualquier persona puede verificar sin wallet.
 */
export async function verificarRegistro(
  registroId: `0x${string}`,
  contentHashHex: string,
  red: RedBlockchain = RED_ACTIVA
): Promise<ResultadoVerificacion> {
  const contractAddress = getContractAddress(red);
  if (!contractAddress) {
    throw new Error(`No hay dirección de contrato para la red "${red}".`);
  }

  const publicClient = getPublicClient(red);
  const contenidoHashBytes32 = hexToBytes32(contentHashHex);

  try {
    const [integro, autor, timestamp] = await publicClient.readContract({
      address: contractAddress,
      abi: DOCUMENT_REGISTRY_ABI,
      functionName: "verificar",
      args: [registroId, contenidoHashBytes32],
    }) as [boolean, `0x${string}`, bigint];

    // Leer el tipo y referenciaId del registro completo
    const registro = await publicClient.readContract({
      address: contractAddress,
      abi: DOCUMENT_REGISTRY_ABI,
      functionName: "obtenerRegistro",
      args: [registroId],
    }) as { tipo: string; referenciaId: string };

    return {
      encontrado: autor !== "0x0000000000000000000000000000000000000000",
      integro,
      autor,
      timestamp: Number(timestamp),
      tipo: registro.tipo,
      referenciaId: registro.referenciaId,
    };
  } catch {
    return {
      encontrado: false,
      integro: false,
      autor: "",
      timestamp: 0,
      tipo: "",
      referenciaId: "",
    };
  }
}

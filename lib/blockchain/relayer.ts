/**
 * Relayer institucional — firma y publica actas en Ethereum del lado del servidor.
 *
 * El coordinador NUNCA conecta una wallet ni firma nada: presiona un botón en la
 * app, la API route (`app/api/blockchain/publicar-acta/route.ts`) llama a
 * `publicarActaEnBlockchain`, que firma con la clave privada institucional
 * (`COPACO_PUBLICADOR_PRIVATE_KEY`, solo en el servidor, nunca con prefijo
 * NEXT_PUBLIC_). Este archivo solo debe importarse desde código de servidor
 * (API routes) — si se importa desde un componente cliente, `getPublicadorAccount`
 * lanzará un error claro en vez de filtrar la clave.
 */

import { createWalletClient, http, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { DOCUMENT_REGISTRY_ABI } from "./abi";
import { CADENAS, getContractAddress, getPublicClient, type RedBlockchain } from "./config";

export interface DatosActa {
  excursionId: string;
  destino: string;
  colonia: string;
  /** Unix timestamp (segundos) de la fecha de la excursión */
  fecha: number;
  totalAsistentes: number;
  cupoMaximo: number;
  coordinadorId: string;
  hashVerificacion: `0x${string}`;
}

export interface ResultadoPublicacion {
  txHash: `0x${string}`;
  actaId: `0x${string}`;
  blockNumber: number;
  publicadoEn: string;
}

function getPublicadorAccount() {
  const privateKey = process.env.COPACO_PUBLICADOR_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "Falta COPACO_PUBLICADOR_PRIVATE_KEY en el entorno del servidor — la wallet " +
        "institucional que publica actas. Configúrala en .env.local (ver .env.local.example)."
    );
  }
  return privateKeyToAccount(privateKey as `0x${string}`);
}

function getRpcUrl(red: RedBlockchain): string {
  if (red === "localhost") return "http://127.0.0.1:8545";
  const alchemyKey = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";
  if (red === "mainnet") {
    return alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.ankr.com/eth";
  }
  return alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.ankr.com/eth_sepolia";
}

/**
 * Publica un acta en DocumentRegistry firmando con la wallet institucional.
 * El coordinador no interviene en la firma — esta función corre en el servidor.
 */
export async function publicarActaEnBlockchain(
  datos: DatosActa,
  red: RedBlockchain
): Promise<ResultadoPublicacion> {
  const contractAddress = getContractAddress(red);
  if (!contractAddress) {
    throw new Error(
      `No hay dirección de contrato configurada para la red "${red}". ` +
        `Despliega el contrato primero con: cd contracts && npm run deploy:${red}`
    );
  }

  const account = getPublicadorAccount();
  const walletClient = createWalletClient({
    account,
    chain: CADENAS[red],
    transport: http(getRpcUrl(red)),
  });

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: DOCUMENT_REGISTRY_ABI,
    functionName: "publicarActa",
    args: [
      datos.excursionId,
      datos.destino,
      datos.colonia,
      BigInt(datos.fecha),
      datos.totalAsistentes,
      datos.cupoMaximo,
      datos.coordinadorId,
      datos.hashVerificacion,
    ],
  });

  const publicClient = getPublicClient(red);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  let actaId = `0x${"0".repeat(64)}` as `0x${string}`;
  let publicadoEnSegundos = Math.floor(Date.now() / 1000);

  try {
    const logs = parseEventLogs({
      abi: DOCUMENT_REGISTRY_ABI,
      logs: receipt.logs,
      eventName: "ActaPublicada",
    });
    if (logs.length > 0) {
      const evento = logs[0] as unknown as { args: { actaId: `0x${string}`; publicadoEn: bigint } };
      actaId = evento.args.actaId;
      publicadoEnSegundos = Number(evento.args.publicadoEn);
    }
  } catch {
    // El acta ya quedó anclada on-chain aunque no se pudo parsear el evento;
    // actaId queda con el valor por defecto y se puede recalcular después.
  }

  return {
    txHash,
    actaId,
    blockNumber: Number(receipt.blockNumber),
    publicadoEn: new Date(publicadoEnSegundos * 1000).toISOString(),
  };
}

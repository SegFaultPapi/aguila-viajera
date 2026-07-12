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

import { createPublicClient, createWalletClient, http, parseEventLogs, ContractFunctionRevertedError } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { DOCUMENT_REGISTRY_ABI } from "./abi";
import { CADENAS, getContractAddress, type RedBlockchain } from "./config";

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
  /**
   * Si true, genera un actaId distinto usando un timestamp de publicación como
   * sufijo en el excursionId on-chain. Permite publicar versiones actualizadas
   * del acta (ej. conteo de asistentes corregido) sin modificar el contrato.
   * El excursionId off-chain (en la BD) nunca cambia; solo el identificador
   * que llega a la cadena en esta publicación.
   */
  forzarNueva?: boolean;
}

export interface ResultadoPublicacion {
  txHash: `0x${string}`;
  actaId: `0x${string}`;
  blockNumber: number;
  publicadoEn: string;
  /** true si se recuperó un acta preexistente en vez de publicar una nueva */
  yaExistia?: boolean;
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
  // Usa ALCHEMY_API_KEY (server-side, sin prefijo NEXT_PUBLIC_) primero
  const alchemyKey = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";
  if (red === "mainnet") {
    return alchemyKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.ankr.com/eth";
  }
  return alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.ankr.com/eth_sepolia";
}

/**
 * Crea un publicClient server-side usando ALCHEMY_API_KEY (no NEXT_PUBLIC_).
 * Este cliente se usa para esperar el receipt — NO el de config.ts que
 * usa la variable pública vacía y cae a Ankr (lento, causa timeout).
 */
function createServerPublicClient(red: RedBlockchain) {
  return createPublicClient({
    chain: CADENAS[red],
    transport: http(getRpcUrl(red), {
      // Cada poll de waitForTransactionReceipt: 3s (Sepolia mina ~12s)
      // Sin este ajuste viem usa 4s, lo que puede acumular latencia
    }),
    pollingInterval: 3_000,
  });
}

// ── Helper: leer acta ya existente en la cadena ───────────────────────────────

type ServerPublicClient = ReturnType<typeof createServerPublicClient>;

async function leerActaExistente(
  actaId: `0x${string}`,
  contractAddress: `0x${string}`,
  publicClient: ServerPublicClient
): Promise<ResultadoPublicacion> {
  try {
    const acta = await publicClient.readContract({
      address: contractAddress,
      abi: DOCUMENT_REGISTRY_ABI,
      functionName: "obtenerActa",
      args: [actaId],
    }) as { publicadoEn: bigint };

    return {
      txHash: actaId,
      actaId,
      blockNumber: 0,
      publicadoEn: new Date(Number(acta.publicadoEn) * 1000).toISOString(),
      yaExistia: true,
    };
  } catch {
    return {
      txHash: actaId,
      actaId,
      blockNumber: 0,
      publicadoEn: new Date().toISOString(),
      yaExistia: true,
    };
  }
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Publica un acta en DocumentRegistry firmando con la wallet institucional.
 * El coordinador no interviene en la firma — esta función corre en el servidor.
 *
 * Si el acta ya fue publicada en una TX anterior (ActaYaExiste), recupera los
 * datos existentes de la cadena y los devuelve — el coordinador ve el resultado
 * correcto sin un mensaje de error confuso.
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

  // Crear ambos clientes antes del try para poder usarlos en el catch
  const publicClient = createServerPublicClient(red);
  const account = getPublicadorAccount();
  const walletClient = createWalletClient({
    account,
    chain: CADENAS[red],
    transport: http(getRpcUrl(red)),
  });

  // Si forzarNueva=true, añadir un sufijo de timestamp al excursionId on-chain
  // para que el contrato genere un actaId distinto al anterior.
  // El excursionId en la BD off-chain nunca cambia — solo el identificador en cadena.
  const excursionIdOnChain = datos.forzarNueva
    ? `${datos.excursionId}::${Date.now()}`
    : datos.excursionId;

  let txHash: `0x${string}`;
  try {
    txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: DOCUMENT_REGISTRY_ABI,
      functionName: "publicarActa",
      args: [
        excursionIdOnChain,
        datos.destino,
        datos.colonia,
        BigInt(datos.fecha),
        datos.totalAsistentes,
        datos.cupoMaximo,
        datos.coordinadorId,
        datos.hashVerificacion,
      ],
    });
  } catch (err) {
    // ActaYaExiste: ya se publicó en una TX anterior (ej. del primer intento
    // que se quedó cargando). Recuperamos los datos de la cadena.
    if (
      err instanceof ContractFunctionRevertedError &&
      err.data?.errorName === "ActaYaExiste"
    ) {
      const actaId = (err.data.args?.[0] as `0x${string}`) ?? `0x${"0".repeat(64)}`;
      return await leerActaExistente(actaId, contractAddress, publicClient);
    }
    throw err;
  }

  // Esperar el receipt. Timeout 55s: suficiente para Sepolia (~12-15s) con margen.
  // Si expira, la TX ya está en cadena — devolvemos el txHash para que el
  // coordinador pueda verificar en Etherscan.
  let receipt;
  try {
    receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 55_000,
      pollingInterval: 3_000,
    });
  } catch {
    return {
      txHash,
      actaId: `0x${"0".repeat(64)}` as `0x${string}`,
      blockNumber: 0,
      publicadoEn: new Date().toISOString(),
    };
  }

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
    // El acta quedó anclada on-chain aunque no se pudo parsear el evento.
  }

  return {
    txHash,
    actaId,
    blockNumber: Number(receipt.blockNumber),
    publicadoEn: new Date(publicadoEnSegundos * 1000).toISOString(),
  };
}

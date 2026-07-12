import { createPublicClient, http, Chain } from "viem";
import { sepolia, mainnet } from "viem/chains";

/**
 * Configuración de red para DocumentRegistry.
 *
 * Flujo de despliegue:
 *   1. Deploy a Sepolia con `npm run deploy:sepolia` en /contracts
 *   2. Copiar la dirección en SEPOLIA_CONTRACT_ADDRESS abajo
 *   3. Probar verificación pública en https://sepolia.etherscan.io
 *   4. Cuando el piloto COPACO esté listo → deploy a mainnet y actualizar MAINNET_CONTRACT_ADDRESS
 */

// ── Direcciones del contrato desplegado ──────────────────────────────────────
// Se actualizan después de ejecutar `npm run deploy:sepolia` / `deploy:mainnet`
// en el directorio /contracts y verificar el contrato en Etherscan.

export const CONTRACT_ADDRESSES = {
  sepolia:  (process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_SEPOLIA  ?? "") as `0x${string}`,
  mainnet:  (process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_MAINNET  ?? "") as `0x${string}`,
  localhost:(process.env.NEXT_PUBLIC_DOCUMENT_REGISTRY_LOCAL    ?? "") as `0x${string}`,
} as const;

export type RedBlockchain = keyof typeof CONTRACT_ADDRESSES;

// ── Clientes de lectura (público, sin wallet) ────────────────────────────────
// Para verificación pública — cualquier usuario puede leer sin conectar wallet.

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const publicClientSepolia = createPublicClient({
  chain: sepolia,
  transport: http(
    ALCHEMY_KEY
      ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
      : "https://rpc.ankr.com/eth_sepolia"
  ),
});

export const publicClientMainnet = createPublicClient({
  chain: mainnet,
  transport: http(
    ALCHEMY_KEY
      ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
      : "https://rpc.ankr.com/eth"
  ),
});

export function getPublicClient(red: RedBlockchain) {
  if (red === "mainnet") return publicClientMainnet;
  return publicClientSepolia;
}

export function getContractAddress(red: RedBlockchain): `0x${string}` {
  return CONTRACT_ADDRESSES[red];
}

// ── URLs de Etherscan ─────────────────────────────────────────────────────────

export function etherscanTxUrl(txHash: string, red: RedBlockchain): string {
  const base = red === "mainnet"
    ? "https://etherscan.io"
    : "https://sepolia.etherscan.io";
  return `${base}/tx/${txHash}`;
}

export function etherscanAddressUrl(address: string, red: RedBlockchain): string {
  const base = red === "mainnet"
    ? "https://etherscan.io"
    : "https://sepolia.etherscan.io";
  return `${base}/address/${address}`;
}

// ── Cadenas soportadas ────────────────────────────────────────────────────────

export const CADENAS: Record<RedBlockchain, Chain> = {
  sepolia,
  mainnet,
  localhost: {
    ...sepolia,
    id: 31337,
    name: "Localhost",
    rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
  } as Chain,
};

export const RED_ACTIVA: RedBlockchain =
  (process.env.NEXT_PUBLIC_BLOCKCHAIN_RED as RedBlockchain) ?? "sepolia";

/**
 * ABI del contrato DocumentRegistry.
 * Generado a partir de contracts/src/DocumentRegistry.sol
 *
 * Para regenerar después de cambios al contrato:
 *   cd contracts && npm run compile
 *   # luego copiar el ABI desde contracts/artifacts/src/DocumentRegistry.sol/DocumentRegistry.json
 */
export const DOCUMENT_REGISTRY_ABI = [
  // ── Eventos ──────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "RegistroAnclado",
    inputs: [
      { name: "registroId",    type: "bytes32", indexed: true  },
      { name: "contenidoHash", type: "bytes32", indexed: true  },
      { name: "autor",         type: "address", indexed: true  },
      { name: "timestamp",     type: "uint64",  indexed: false },
      { name: "tipo",          type: "string",  indexed: false },
      { name: "referenciaId",  type: "string",  indexed: false },
    ],
  },

  // ── Errores ───────────────────────────────────────────────────────────────
  {
    type: "error",
    name: "RegistroYaExiste",
    inputs: [{ name: "registroId", type: "bytes32" }],
  },
  { type: "error", name: "HashVacio",      inputs: [] },
  { type: "error", name: "TipoVacio",      inputs: [] },
  { type: "error", name: "ReferenciaVacia", inputs: [] },

  // ── Escritura ─────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "anclar",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contenidoHash", type: "bytes32" },
      { name: "tipo",          type: "string"  },
      { name: "referenciaId",  type: "string"  },
    ],
    outputs: [{ name: "registroId", type: "bytes32" }],
  },

  // ── Lectura ───────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "verificar",
    stateMutability: "view",
    inputs: [
      { name: "registroId",    type: "bytes32" },
      { name: "contenidoHash", type: "bytes32" },
    ],
    outputs: [
      { name: "integro",   type: "bool"    },
      { name: "autor",     type: "address" },
      { name: "timestamp", type: "uint64"  },
    ],
  },
  {
    type: "function",
    name: "obtenerRegistro",
    stateMutability: "view",
    inputs: [{ name: "registroId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "contenidoHash", type: "bytes32" },
          { name: "autor",         type: "address" },
          { name: "timestamp",     type: "uint64"  },
          { name: "tipo",          type: "string"  },
          { name: "referenciaId",  type: "string"  },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalRegistros",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "obtenerRegistros",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limite", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "listaRegistros",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

export type DocumentRegistryAbi = typeof DOCUMENT_REGISTRY_ABI;

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
    name: "ActaPublicada",
    inputs: [
      { name: "actaId",          type: "bytes32", indexed: true  },
      { name: "excursionId",     type: "string",  indexed: false },
      { name: "destino",         type: "string",  indexed: false },
      { name: "totalAsistentes", type: "uint32",  indexed: false },
      { name: "publicadoEn",     type: "uint64",  indexed: false },
    ],
  },
  {
    type: "event",
    name: "PublicadorActualizado",
    inputs: [
      { name: "anterior", type: "address", indexed: true },
      { name: "nuevo",    type: "address", indexed: true },
    ],
  },

  // ── Errores ───────────────────────────────────────────────────────────────
  { type: "error", name: "NoAutorizado",    inputs: [] },
  { type: "error", name: "ExcursionIdVacio", inputs: [] },
  {
    type: "error",
    name: "ActaYaExiste",
    inputs: [{ name: "actaId", type: "bytes32" }],
  },

  // ── Escritura ─────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "publicarActa",
    stateMutability: "nonpayable",
    inputs: [
      { name: "excursionId",      type: "string"  },
      { name: "destino",          type: "string"  },
      { name: "colonia",          type: "string"  },
      { name: "fecha",            type: "uint64"  },
      { name: "totalAsistentes",  type: "uint32"  },
      { name: "cupoMaximo",       type: "uint32"  },
      { name: "coordinadorId",    type: "string"  },
      { name: "hashVerificacion", type: "bytes32" },
    ],
    outputs: [{ name: "actaId", type: "bytes32" }],
  },
  {
    type: "function",
    name: "cambiarPublicador",
    stateMutability: "nonpayable",
    inputs: [{ name: "nuevo", type: "address" }],
    outputs: [],
  },

  // ── Lectura ───────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "obtenerActa",
    stateMutability: "view",
    inputs: [{ name: "actaId", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "excursionId",      type: "string"  },
          { name: "destino",          type: "string"  },
          { name: "colonia",          type: "string"  },
          { name: "fecha",            type: "uint64"  },
          { name: "totalAsistentes",  type: "uint32"  },
          { name: "cupoMaximo",       type: "uint32"  },
          { name: "coordinadorId",    type: "string"  },
          { name: "hashVerificacion", type: "bytes32" },
          { name: "publicadoEn",      type: "uint64"  },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalActas",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "obtenerActas",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limite", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "listaActas",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "publicador",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export type DocumentRegistryAbi = typeof DOCUMENT_REGISTRY_ABI;

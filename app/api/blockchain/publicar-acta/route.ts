import { NextRequest, NextResponse } from "next/server";
import { publicarActaEnBlockchain } from "@/lib/blockchain/relayer";
import { etherscanTxUrl, RED_ACTIVA } from "@/lib/blockchain/config";
import { contenidoCanonicoActa, hashObjeto, hexToBytes32 } from "@/lib/crypto";

/**
 * Publica el acta de una excursión en Ethereum. El coordinador solo aprieta un
 * botón — esta ruta firma la transacción con la wallet institucional del
 * servidor (ver lib/blockchain/relayer.ts). Nunca sube nombres, teléfonos,
 * datos de salud ni imágenes: solo destino, colonia, fecha y el número de
 * asistentes. `idsAsistentes` se usa únicamente para calcular una huella de
 * verificación (hash) y nunca llega a la blockchain.
 */

interface BodyPublicarActa {
  excursionId: string;
  destino: string;
  colonia: string;
  /** Fecha ISO de la excursión */
  fecha: string;
  totalAsistentes: number;
  cupoMaximo: number;
  coordinadorId: string;
  /** IDs internos de inscripción de quienes asistieron — solo para el hash, nunca on-chain */
  idsAsistentes: string[];
  /**
   * Si true, genera un actaId distinto para permitir republicar una versión
   * actualizada del acta (ej. conteo de asistentes corregido).
   */
  forzarNueva?: boolean;
}

export async function POST(req: NextRequest) {
  let body: BodyPublicarActa;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { excursionId, destino, colonia, fecha, totalAsistentes, cupoMaximo, coordinadorId, idsAsistentes, forzarNueva } = body;

  if (
    !excursionId ||
    !destino ||
    !fecha ||
    !coordinadorId ||
    typeof totalAsistentes !== "number" ||
    typeof cupoMaximo !== "number"
  ) {
    return NextResponse.json({ error: "Faltan campos obligatorios del acta." }, { status: 400 });
  }

  try {
    const contenidoActa = await contenidoCanonicoActa({
      excursionId,
      excursionFecha: fecha,
      coordinadorId,
      idsAsistentes: idsAsistentes ?? [],
      actaTimestamp: new Date().toISOString(),
    });
    const hashHex = await hashObjeto(contenidoActa);
    const hashVerificacion = hexToBytes32(hashHex);

    const resultado = await publicarActaEnBlockchain(
      {
        excursionId,
        destino,
        colonia,
        fecha: Math.floor(new Date(fecha).getTime() / 1000),
        totalAsistentes,
        cupoMaximo,
        coordinadorId,
        hashVerificacion,
        forzarNueva: forzarNueva === true,
      },
      RED_ACTIVA
    );

    const redEtherscan = RED_ACTIVA === "mainnet" ? "mainnet" : "sepolia";
    return NextResponse.json({
      txHash: resultado.txHash,
      actaId: resultado.actaId,
      blockNumber: resultado.blockNumber,
      publicadoEn: resultado.publicadoEn,
      yaExistia: resultado.yaExistia ?? false,
      etherscanUrl: etherscanTxUrl(resultado.txHash, redEtherscan),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al publicar el acta en blockchain.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

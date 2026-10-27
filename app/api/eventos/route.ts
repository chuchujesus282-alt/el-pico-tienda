import { after, NextResponse, type NextRequest } from "next/server";
import { esRobot, LIMITES, limpiarEnvio } from "@/lib/eventos/reglas";
import {
  COOKIE_VISITANTE,
  guardarEventos,
  ipDe,
  mantenimientoSiToca,
  nuevoVisitante,
  opcionesCookieVisitante,
  visitanteValido,
} from "@/lib/eventos/servidor";

// Recibe los eventos para análisis que manda lib/eventos/cliente.ts (sendBeacon o fetch en segundo plano).
// Responde 204 DE INMEDIATO; validar, limitar y guardar en Neon se hace después (after()). Si algo falla, nadie se
// entera: es análisis, no puede romper la tienda. Ver docs/eventos.md.

const nada = () => new NextResponse(null, { status: 204 });

/** Solo desde la misma tienda (un sitio ajeno no puede mandar eventos con el navegador del cliente). */
function mismoSitio(peticion: NextRequest): boolean {
  const sitio = peticion.headers.get("sec-fetch-site");
  if (sitio) return sitio === "same-origin";
  const origen = peticion.headers.get("origin");
  if (!origen) return false;
  try {
    return new URL(origen).host === peticion.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(peticion: NextRequest) {
  if (!mismoSitio(peticion) || esRobot(peticion.headers.get("user-agent"))) return nada();

  let texto: string;
  try {
    texto = await peticion.text();
  } catch {
    return nada();
  }
  if (texto.length > LIMITES.bytesPorEnvio) return nada();

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(texto);
  } catch {
    return nada();
  }
  const eventos = limpiarEnvio(cuerpo);

  // El visitante: el de la cookie, o uno nuevo (la cookie se crea aquí, con el primer evento).
  const respuesta = nada();
  let visitante = visitanteValido(peticion.cookies.get(COOKIE_VISITANTE)?.value);
  if (!visitante) {
    visitante = nuevoVisitante();
    respuesta.cookies.set(COOKIE_VISITANTE, visitante, opcionesCookieVisitante);
  }
  const ip = ipDe(peticion.headers);

  after(async () => {
    try {
      await guardarEventos(visitante, ip, eventos);
    } catch (error) {
      console.error("[eventos] No se pudieron guardar:", error);
    }
    await mantenimientoSiToca();
  });
  return respuesta;
}

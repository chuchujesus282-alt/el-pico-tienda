import type { NextRequest } from "next/server";
import { indiceSiEstaListo } from "@/lib/indiceServidor";
import { limpiarConsulta, responderSugerencias } from "@/lib/busquedaServidor";

// Sugerencias del buscador del header: GET /api/sugerencias?q=martiyo → { productos, correccion, listo }.
// El índice vive en el servidor (lib/indiceServidor.ts); el navegador recibe solo las 6 filas (~2 KB).
// Si el índice todavía se está armando, responde vacío con `listo: false` en el acto (no espera) y el armado sigue en
// segundo plano. NO registra eventos para análisis: cada letra que se escribe no es una búsqueda (eso va en /buscar).

export async function GET(request: NextRequest) {
  const q = limpiarConsulta(request.nextUrl.searchParams.get("q"));
  const respuesta = responderSugerencias(indiceSiEstaListo()?.indice ?? null, q);
  return Response.json(respuesta, {
    headers: {
      // Las consultas repetidas ("tal", "tala", "talad"…) las responde la caché y no llegan al servidor.
      // Sin índice listo no se guarda: la próxima vez ya habrá sugerencias.
      "Cache-Control": respuesta.listo ? "public, s-maxage=60, stale-while-revalidate=300" : "no-store",
    },
  });
}

import "server-only";

import { after } from "next/server";
import { getIndiceConEstado } from "@/lib/catalogo";
import { crearIndicePorPartes, type IndiceBusqueda } from "@/lib/recomendaciones/busqueda";

// Índice de búsqueda ÚNICO de la tienda, en la memoria del servidor. Lo usan /buscar, las sugerencias del buscador del
// header (/api/sugerencias) y "Te puede interesar" (/api/te-puede-interesar). El navegador ya no descarga el catálogo:
// con ~30.000 productos serían 6,6 MB y ~76 MB de memoria en cada teléfono. Responsable: persona A.
//
// - Se arma con la lista de getIndiceConEstado() (base + Saint), que es la MISMA mientras nada cambie: entonces el
//   índice se reutiliza (crearIndicePorPartes también lo guarda por lista). Con 30.000 productos tarda ~0,4 s.
// - Un solo armado a la vez (promesa compartida).
// - Por partes: cede el turno entre tandas, así el servidor sigue respondiendo otras visitas mientras se arma.
// - Nada de cron jobs (en el plan Hobby de Vercel solo corren una vez al día): el índice se arma la primera vez que
//   alguien lo necesita. Las sugerencias no esperan: si no está listo responden vacío y el armado sigue en segundo
//   plano con after() (en Vercel, el trabajo que queda después de responder se congela si no se le avisa).

export type EstadoIndice = {
  indice: IndiceBusqueda;
  /** false: faltó una parte del catálogo (Saint no respondió y no había lista guardada). */
  completo: boolean;
};

let listo: EstadoIndice | null = null;
let armando: Promise<EstadoIndice> | null = null;

/** Revisa si el catálogo cambió y, si cambió (o es la primera vez), arma el índice. */
function armar(): Promise<EstadoIndice> {
  armando ??= (async () => {
    const { productos, completo } = await getIndiceConEstado();
    const indice = listo?.indice.productos === productos ? listo.indice : await crearIndicePorPartes(productos);
    listo = { indice, completo };
    return listo;
  })().finally(() => {
    armando = null;
  });
  return armando;
}

/** El índice al día (espera a que se arme si hace falta). Para /buscar. Lanza si el catálogo no se pudo cargar. */
export function indice(): Promise<EstadoIndice> {
  return armar();
}

/**
 * El índice si ya está armado, o null, SIN esperar. En ambos casos revisa en segundo plano si el catálogo cambió (y
 * arma el índice si hace falta), con after() para que en Vercel ese trabajo termine aunque ya se haya respondido.
 */
export function indiceSiEstaListo(): EstadoIndice | null {
  const trabajo = armar().catch((error: unknown) => {
    console.error("[indice]", error instanceof Error ? error.message : error);
  });
  try {
    after(() => trabajo);
  } catch {
    // Fuera de una petición (no debería pasar): el trabajo sigue igual mientras el proceso viva.
  }
  return listo;
}

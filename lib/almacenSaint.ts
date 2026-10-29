// Núcleo de la caché de productos de Saint, por categoría (responsable: persona A). Sin Next ni red: lib/saint.ts le
// pasa la caché compartida (unstable_cache) y el pedido directo a Saint; así se prueba con Vitest
// (lib/__tests__/almacenSaint.test.ts).
//
// Tres capas, de la más cercana a la más lejana:
// 1. MEMORIA de este servidor: la lista ya convertida (nombres legibles, grupos de medidas, árbol), que el índice de
//    búsqueda reutiliza si recibe la MISMA lista. Se vuelve a mirar la caché compartida cada `revisarCadaMs`.
// 2. CACHÉ COMPARTIDA entre servidores (unstable_cache): la respuesta de Saint con su `huella` y la hora del pedido. Si
//    la huella no cambió, no se vuelve a convertir.
// 3. SAINT: si la caché compartida está vacía (ahí mismo la llena) o si lo guardado pasa de `topeMs` (esa visita
//    espera el pedido directo; precios reales de venta: nunca más viejos que el tope si Saint responde).
// Si Saint falla: lo guardado vencido de la caché compartida y, si no hay, la última lista buena en memoria; si no
// hay nada, se lanza el error. Las visitas simultáneas de este servidor comparten un solo pedido por categoría.

/** Lo que guarda la caché compartida de una categoría. Solo datos que se pueden pasar a JSON. */
export type EntradaSaint = {
  /** La parte de la respuesta de Saint de esta categoría (lo que recibe convertir()). */
  crudo: unknown;
  /** Huella del contenido: igual = misma respuesta, no hace falta volver a convertir. */
  huella: string;
  /** Cuándo se le pidió a Saint (ms desde 1970). */
  pedidoEn: number;
  /** Tamaño de la respuesta de Saint (caracteres). */
  caracteres: number;
};

/** De dónde salió una categoría en una lectura (para el registro [saint] tiempo). */
export type OrigenSaint = "cache" | "saint" | "tope" | "vencida";

export type LecturaSaint = {
  slug: string;
  origen: OrigenSaint;
  /** Lo que tardó leer la caché compartida (o el pedido a Saint, si estaba vacía). */
  msLectura: number;
  /** Lo que tardó el pedido directo a Saint por el tope (origen "tope"). */
  msDirecto?: number;
  /** Lo que tardó convertir; sin valor si la huella no cambió. */
  msConvertir?: number;
  caracteres: number;
  /** Antigüedad de lo que se sirvió. */
  edadMs: number;
};

type Opciones<T> = {
  /** Lee la caché compartida; si está vacía, la llena pidiéndole a Saint (y lanza si Saint falla). */
  leerCompartida: (codigo: number) => Promise<EntradaSaint>;
  /** Le pide a Saint directo, sin caché. */
  pedirDirecto: (codigo: number) => Promise<EntradaSaint>;
  convertir: (slug: string, crudo: unknown) => T;
  revisarCadaMs: number;
  topeMs: number;
  ahora?: () => number;
  registrar?: (lectura: LecturaSaint) => void;
  /** Cuando se sirve algo guardado porque Saint falló. */
  avisarFallo?: (slug: string, error: unknown) => void;
};

type EnMemoria<T> = { datos: T; huella: string; pedidoEn: number; revisar: number };

export function crearAlmacenSaint<T>(opciones: Opciones<T>) {
  const ahora = opciones.ahora ?? Date.now;
  const memoria = new Map<number, EnMemoria<T>>();
  const enCurso = new Map<number, Promise<T>>();

  async function cargar(slug: string, codigo: number): Promise<T> {
    const inicio = ahora();
    let entrada = await opciones.leerCompartida(codigo);
    const msLectura = ahora() - inicio;
    // Si la caché estaba vacía, la entrada se pidió a Saint durante esta misma lectura.
    let origen: OrigenSaint = entrada.pedidoEn >= inicio ? "saint" : "cache";
    let msDirecto: number | undefined;

    if (ahora() - entrada.pedidoEn > opciones.topeMs) {
      const inicioDirecto = ahora();
      try {
        entrada = await opciones.pedirDirecto(codigo);
        origen = "tope";
      } catch (error) {
        // Saint no responde: sirve lo guardado aunque pase del tope (nunca se queda sin productos).
        opciones.avisarFallo?.(slug, error);
        origen = "vencida";
      }
      msDirecto = ahora() - inicioDirecto;
    }

    const anterior = memoria.get(codigo);
    let datos: T;
    let msConvertir: number | undefined;
    if (anterior && anterior.huella === entrada.huella) {
      datos = anterior.datos; // la MISMA lista: el índice de búsqueda no se rehace
    } else {
      const inicioConvertir = ahora();
      datos = opciones.convertir(slug, entrada.crudo);
      msConvertir = ahora() - inicioConvertir;
    }
    memoria.set(codigo, { datos, huella: entrada.huella, pedidoEn: entrada.pedidoEn, revisar: ahora() + opciones.revisarCadaMs });
    opciones.registrar?.({
      slug,
      origen,
      msLectura,
      msDirecto,
      msConvertir,
      caracteres: entrada.caracteres,
      edadMs: ahora() - entrada.pedidoEn,
    });
    return datos;
  }

  /** Una categoría ya convertida. Lanza si no hay nada (ni en Saint, ni en la caché compartida, ni en memoria). */
  function categoria(slug: string, codigo: number): Promise<T> {
    const guardada = memoria.get(codigo);
    if (guardada && guardada.revisar > ahora() && ahora() - guardada.pedidoEn <= opciones.topeMs) {
      return Promise.resolve(guardada.datos);
    }
    let pedido = enCurso.get(codigo);
    if (!pedido) {
      pedido = cargar(slug, codigo)
        .catch((error: unknown) => {
          const ultima = memoria.get(codigo);
          if (!ultima) throw error;
          opciones.avisarFallo?.(slug, error);
          ultima.revisar = ahora() + opciones.revisarCadaMs; // no reintentar en cada visita mientras Saint está caído
          return ultima.datos;
        })
        .finally(() => enCurso.delete(codigo));
      enCurso.set(codigo, pedido);
    }
    return pedido;
  }

  /**
   * Todas las categorías del mapa (slug → código), juntando las de arriba: si una falla, las demás siguen y
   * `completo` queda en false. Devuelve los mismos objetos mientras nada cambie.
   */
  async function todas(mapa: Record<string, number>): Promise<{ listas: T[]; completo: boolean; fallidas: string[] }> {
    const slugs = Object.keys(mapa);
    const resultados = await Promise.allSettled(slugs.map((slug) => categoria(slug, mapa[slug])));
    const listas: T[] = [];
    const fallidas: string[] = [];
    resultados.forEach((r, i) => (r.status === "fulfilled" ? listas.push(r.value) : fallidas.push(slugs[i])));
    return { listas, completo: fallidas.length === 0, fallidas };
  }

  /** Olvida lo que hay en memoria (de una categoría o de todas): la próxima visita vuelve a mirar la caché compartida. */
  function olvidar(codigo?: number) {
    if (codigo === undefined) memoria.clear();
    else memoria.delete(codigo);
  }

  return { categoria, todas, olvidar };
}

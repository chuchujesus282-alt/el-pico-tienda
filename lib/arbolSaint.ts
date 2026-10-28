// Árbol de subcategorías de Saint ("instancias") para la barra izquierda de la página de categoría. Responsable:
// persona A. Lógica pura (sin red) para poder probarla; la usa lib/saint.ts al convertir la respuesta.
//
// Saint manda, por categoría, `instancias: [{ codigo, nombre, padre, codCategoria }]` con TODOS los niveles (sin la
// categoría raíz: si `padre` es el código de la categoría, es del primer nivel) y cada producto trae `codInstancia`
// (la instancia exacta, la última del árbol). Hoy hay ramas de hasta 6 niveles (Construcción).
// - Las ramas sin productos (ni en ellas ni debajo) se quitan.
// - El orden de las hermanas es el de Saint.
// - Los nombres se muestran legibles (con acentos: lib/nombresSaint.ts).

export type NodoArbol = {
  codigo: number;
  nombre: string;
  /** null: primer nivel (cuelga de la categoría). */
  padre: number | null;
  /** Hijas que tienen productos, en el orden de Saint. */
  hijas: number[];
};

export type ArbolSaint = {
  nodos: Map<number, NodoArbol>;
  /** Primer nivel (con productos), en el orden de Saint. */
  raices: number[];
};

export type OpcionArbol = { codigo: number; nombre: string; tieneHijas: boolean };

/** Lo que necesita el panel para mostrar el nivel actual. */
export type NavegacionArbol = {
  /** El nivel actual (null: "Todas", la categoría completa). */
  actual: { codigo: number; nombre: string } | null;
  /** Del primer nivel al actual (sin la categoría): para la ruta "Construcción › … › actual". */
  ruta: { codigo: number; nombre: string }[];
  /** Lo que se lista: las hijas del actual, o (si el actual no tiene hijas) sus hermanas con el actual marcado. */
  opciones: OpcionArbol[];
  /** true: `opciones` son las hermanas del actual (está en el último nivel). */
  sonHermanas: boolean;
};

const codigoDe = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Arma el árbol de una categoría con las instancias de Saint, dejando solo las ramas con productos.
 * `conProductos`: las instancias donde hay al menos un producto (su `codInstancia`).
 */
export function armarArbol(
  instancias: unknown[],
  codCategoria: number,
  conProductos: Iterable<number>,
  legible: (nombre: string) => string,
): ArbolSaint {
  const todos = new Map<number, { codigo: number; nombre: string; padre: number | null }>();
  for (const fila of instancias) {
    const { codigo, nombre, padre } = (fila ?? {}) as Record<string, unknown>;
    const cod = codigoDe(codigo);
    if (cod === undefined || cod === codCategoria || typeof nombre !== "string" || !nombre.trim()) continue;
    const pad = codigoDe(padre);
    todos.set(cod, { codigo: cod, nombre: legible(nombre.trim()), padre: pad === undefined || pad === codCategoria ? null : pad });
  }

  // Marca cada instancia con productos y todas las de arriba (hasta el primer nivel).
  const vivos = new Set<number>();
  for (const cod of conProductos) {
    let actual = todos.get(cod);
    while (actual && !vivos.has(actual.codigo)) {
      vivos.add(actual.codigo);
      actual = actual.padre === null ? undefined : todos.get(actual.padre);
    }
  }

  const nodos = new Map<number, NodoArbol>();
  const raices: number[] = [];
  for (const nodo of todos.values()) {
    if (!vivos.has(nodo.codigo)) continue;
    // Un padre que no está en la lista: se trata como primer nivel (no se pierde la rama).
    const padre = nodo.padre !== null && todos.has(nodo.padre) ? nodo.padre : null;
    nodos.set(nodo.codigo, { ...nodo, padre, hijas: [] });
  }
  for (const nodo of nodos.values()) {
    if (nodo.padre === null) raices.push(nodo.codigo);
    else nodos.get(nodo.padre)?.hijas.push(nodo.codigo);
  }
  return { nodos, raices };
}

/** Del primer nivel hasta `codigo` (incluido). Vacío si no está en el árbol. */
export function rutaDe(arbol: ArbolSaint, codigo: number): number[] {
  const ruta: number[] = [];
  let nodo = arbol.nodos.get(codigo);
  // `!ruta.includes`: si Saint mandara un ciclo (A padre de B y B de A), no se queda dando vueltas.
  while (nodo && !ruta.includes(nodo.codigo)) {
    ruta.unshift(nodo.codigo);
    nodo = nodo.padre === null ? undefined : arbol.nodos.get(nodo.padre);
  }
  return ruta;
}

/** Cada instancia y todas las de arriba: para saber si un producto está "debajo" de un nivel. */
export function ancestros(arbol: ArbolSaint, codigo: number | undefined): Set<number> {
  return new Set(codigo === undefined ? [] : rutaDe(arbol, codigo));
}

/** Código de primer nivel por su nombre (para los enlaces viejos ?subcategoria=Nombre). */
export function codigoPorNombre(arbol: ArbolSaint, nombre: string): number | undefined {
  return arbol.raices.find((c) => arbol.nodos.get(c)?.nombre === nombre);
}

const opcion = (arbol: ArbolSaint, codigo: number): OpcionArbol => {
  const nodo = arbol.nodos.get(codigo)!;
  return { codigo, nombre: nodo.nombre, tieneHijas: nodo.hijas.length > 0 };
};

/** Lo que muestra el panel en el nivel `actual` (undefined o un código que no existe: "Todas"). */
export function navegacion(arbol: ArbolSaint, actual: number | undefined): NavegacionArbol {
  const nodo = actual === undefined ? undefined : arbol.nodos.get(actual);
  if (!nodo) return { actual: null, ruta: [], opciones: arbol.raices.map((c) => opcion(arbol, c)), sonHermanas: false };

  const ruta = rutaDe(arbol, nodo.codigo).map((c) => ({ codigo: c, nombre: arbol.nodos.get(c)!.nombre }));
  if (nodo.hijas.length) {
    return { actual: { codigo: nodo.codigo, nombre: nodo.nombre }, ruta, opciones: nodo.hijas.map((c) => opcion(arbol, c)), sonHermanas: false };
  }
  // Último nivel: sus hermanas, con el actual marcado.
  const hermanas = nodo.padre === null ? arbol.raices : arbol.nodos.get(nodo.padre)!.hijas;
  return { actual: { codigo: nodo.codigo, nombre: nodo.nombre }, ruta, opciones: hermanas.map((c) => opcion(arbol, c)), sonHermanas: true };
}

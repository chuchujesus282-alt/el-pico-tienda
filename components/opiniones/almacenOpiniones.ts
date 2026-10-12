import type { Opinion } from "@/types/opiniones";

// Opiniones que escribe el cliente, guardadas en su navegador (localStorage) mientras no haya base de datos.
// Mismo patrón que el carrito (components/carrito/almacenCarrito.ts): se lee con useSyncExternalStore.

const CLAVE = "el-pico:opiniones";
const VACIO: Opinion[] = [];

let opiniones: Opinion[] = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leer(): Opinion[] {
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(datos) ? datos.filter((o) => o?.id && o?.productoId && o.calificacion >= 1) : VACIO;
  } catch {
    return VACIO;
  }
}

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function alCambiarOtraPestana(evento: StorageEvent) {
  if (evento.key !== CLAVE) return;
  opiniones = leer();
  avisar();
}

export function suscribir(oyente: () => void) {
  if (oyentes.size === 0) window.addEventListener("storage", alCambiarOtraPestana);
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

/** Se lee del navegador la primera vez que se pide (no al suscribirse): así varios componentes
 *  que se montan a la vez ven el mismo dato y React no recibe cambios a mitad del montaje. */
export function obtenerOpiniones() {
  if (!cargado) {
    opiniones = leer();
    cargado = true;
  }
  return opiniones;
}
export const obtenerOpinionesServidor = () => VACIO;

function guardar(nuevas: Opinion[]) {
  opiniones = nuevas;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevas));
  } catch {
    // Sin almacenamiento (modo privado): la opinión vive solo en esta pestaña.
  }
  avisar();
}

export function agregarOpinion(opinion: Opinion) {
  guardar([opinion, ...obtenerOpiniones()]);
}

export function eliminarOpinion(id: string) {
  guardar(obtenerOpiniones().filter((o) => o.id !== id));
}

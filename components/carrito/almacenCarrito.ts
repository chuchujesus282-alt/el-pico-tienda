import type { ItemCarrito } from "@/types/carrito";

// Almacén del carrito en el navegador (localStorage), leído con useSyncExternalStore.
// Se sincroniza entre pestañas con el evento "storage".

const CLAVE = "el-pico:carrito";
const VACIO: ItemCarrito[] = [];

let items: ItemCarrito[] = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leer(): ItemCarrito[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as ItemCarrito[]) : VACIO;
    return Array.isArray(datos) ? datos.filter((i) => i?.producto?.id && i.cantidad > 0) : VACIO;
  } catch {
    return VACIO;
  }
}

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function alCambiarOtraPestana(evento: StorageEvent) {
  if (evento.key !== CLAVE) return;
  items = leer();
  avisar();
}

export function suscribir(oyente: () => void) {
  if (!cargado) {
    items = leer();
    cargado = true;
  }
  if (oyentes.size === 0) window.addEventListener("storage", alCambiarOtraPestana);
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export const obtenerItems = () => items;
export const obtenerItemsServidor = () => VACIO;

export function guardarItems(nuevos: ItemCarrito[]) {
  items = nuevos;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Sin almacenamiento (modo privado): el carrito vive solo en esta pestaña.
  }
  avisar();
}

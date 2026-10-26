"use client";

import { useCallback, useSyncExternalStore } from "react";

// Favoritos del cliente en el navegador (localStorage), leídos con useSyncExternalStore.
// Solo guarda los códigos de producto (lo más reciente primero): nombre, precio y foto se piden
// al catálogo al mostrar /favoritos, así nunca salen precios viejos. Se sincroniza entre pestañas.

const CLAVE = "el-pico:favoritos";
const VACIO: string[] = [];

let ids: string[] = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leer(): string[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : VACIO;
    return Array.isArray(datos) ? datos.filter((id): id is string => typeof id === "string" && id.length > 0) : VACIO;
  } catch {
    return VACIO;
  }
}

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function alCambiarOtraPestana(evento: StorageEvent) {
  if (evento.key !== CLAVE) return;
  ids = leer();
  avisar();
}

function suscribir(oyente: () => void) {
  if (!cargado) {
    ids = leer();
    cargado = true;
  }
  if (oyentes.size === 0) window.addEventListener("storage", alCambiarOtraPestana);
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const obtenerIds = () => ids;
const obtenerIdsServidor = () => VACIO;

function guardar(nuevos: string[]) {
  ids = nuevos;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    // Sin almacenamiento (modo privado): los favoritos viven solo en esta pestaña.
  }
  avisar();
}

// Para copiar los favoritos a la cuenta (components/cuenta/SincronizarCuenta.tsx).
export { suscribir as suscribirFavoritos, obtenerIds as obtenerFavoritos, guardar as reemplazarFavoritos };

/** Favoritos del cliente: la lista de códigos y cómo marcarlos o quitarlos. */
export function useFavoritos() {
  const lista = useSyncExternalStore(suscribir, obtenerIds, obtenerIdsServidor);

  const esFavorito = useCallback((id: string) => lista.includes(id), [lista]);

  /** Marca o desmarca un producto; devuelve true si quedó en favoritos. */
  const alternar = useCallback((id: string) => {
    const actuales = obtenerIds();
    const estaba = actuales.includes(id);
    guardar(estaba ? actuales.filter((i) => i !== id) : [id, ...actuales]);
    return !estaba;
  }, []);

  const quitar = useCallback((id: string) => guardar(obtenerIds().filter((i) => i !== id)), []);

  return { ids: lista, cantidad: lista.length, esFavorito, alternar, quitar };
}

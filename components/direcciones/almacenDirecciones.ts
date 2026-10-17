"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MAXIMO_DIRECCIONES, ubicacionValida } from "@/lib/direcciones";
import type { Direccion } from "@/types/cliente";

// Direcciones de entrega del cliente en el navegador (localStorage), leídas con useSyncExternalStore,
// igual que los favoritos. Guarda la lista y cuál eligió en el header ("Entregar en"). Cuando haya
// cuentas, este almacén se sincroniza con la cuenta y las pantallas no cambian. Se sincroniza entre pestañas.

const CLAVE = "el-pico:direcciones";

type Estado = { lista: Direccion[]; elegidaId: string | null };
const VACIO: Estado = { lista: [], elegidaId: null };

let estado: Estado = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function esDireccion(d: unknown): d is Direccion {
  const x = d as Direccion | null;
  return (
    !!x &&
    typeof x.id === "string" &&
    typeof x.nombre === "string" &&
    typeof x.descripcion === "string" &&
    ubicacionValida({ latitud: x.latitud, longitud: x.longitud })
  );
}

function leer(): Estado {
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE) ?? "null") as Partial<Estado> | null;
    const lista = Array.isArray(datos?.lista) ? datos.lista.filter(esDireccion).slice(0, MAXIMO_DIRECCIONES) : [];
    const elegidaId = lista.some((d) => d.id === datos?.elegidaId) ? (datos?.elegidaId ?? null) : null;
    return { lista, elegidaId };
  } catch {
    return VACIO;
  }
}

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

function alCambiarOtraPestana(evento: StorageEvent) {
  if (evento.key !== CLAVE) return;
  estado = leer();
  avisar();
}

function suscribir(oyente: () => void) {
  if (!cargado) {
    estado = leer();
    cargado = true;
  }
  if (oyentes.size === 0) window.addEventListener("storage", alCambiarOtraPestana);
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const obtener = () => estado;
const obtenerServidor = () => VACIO;

function guardarEstado(nuevo: Estado) {
  estado = nuevo;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Sin almacenamiento (modo privado): las direcciones viven solo en esta pestaña.
  }
  avisar();
}

function idNuevo() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `dir-${Date.now()}`;
}

/**
 * Direcciones del cliente: la lista, la elegida en el header y cómo guardarlas, elegirlas o borrarlas.
 * `listo` es false hasta leer el navegador (antes de eso no se sabe si hay direcciones).
 */
export function useDirecciones() {
  const { lista, elegidaId } = useSyncExternalStore(suscribir, obtener, obtenerServidor);
  const listo = useSyncExternalStore(suscribir, () => cargado, () => false);

  /** Agrega una dirección nueva (sin `id`) o reemplaza la que tenga ese `id`. Devuelve la guardada. */
  const guardar = useCallback((datos: Omit<Direccion, "id"> & { id?: string }) => {
    const actual = obtener();
    const direccion: Direccion = { ...datos, id: datos.id ?? idNuevo() };
    const existe = actual.lista.some((d) => d.id === direccion.id);
    const lista = existe ? actual.lista.map((d) => (d.id === direccion.id ? direccion : d)) : [...actual.lista, direccion];
    // La primera dirección queda elegida sola: así el header ya muestra a dónde llega el pedido.
    guardarEstado({ lista, elegidaId: actual.elegidaId ?? direccion.id });
    return direccion;
  }, []);

  const elegir = useCallback((id: string) => {
    const actual = obtener();
    if (actual.lista.some((d) => d.id === id)) guardarEstado({ ...actual, elegidaId: id });
  }, []);

  const quitar = useCallback((id: string) => {
    const actual = obtener();
    const lista = actual.lista.filter((d) => d.id !== id);
    guardarEstado({ lista, elegidaId: actual.elegidaId === id ? (lista[0]?.id ?? null) : actual.elegidaId });
  }, []);

  return {
    direcciones: lista,
    elegida: lista.find((d) => d.id === elegidaId) ?? null,
    listo,
    lleno: lista.length >= MAXIMO_DIRECCIONES,
    guardar,
    elegir,
    quitar,
  };
}

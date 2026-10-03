"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Producto } from "@/types/catalogo";
import type { ItemCarrito } from "@/types/carrito";
import { totalCarrito } from "@/lib/whatsapp";
import { guardarItems, obtenerItems, obtenerItemsServidor, suscribir } from "./almacenCarrito";
import PanelCarrito from "./PanelCarrito";

type ContextoCarrito = {
  items: ItemCarrito[];
  cantidadTotal: number;
  total: number;
  agregar: (producto: Producto, cantidad?: number) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
};

const Contexto = createContext<ContextoCarrito | null>(null);

export function useCarrito() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>");
  return valor;
}

export default function ProveedorCarrito({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(suscribir, obtenerItems, obtenerItemsServidor);
  const [abierto, setAbierto] = useState(false);

  const agregar = useCallback((producto: Producto, cantidad = 1) => {
    const actuales = obtenerItems();
    const existe = actuales.some((i) => i.producto.id === producto.id);
    guardarItems(
      existe
        ? actuales.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i))
        : [...actuales, { producto, cantidad }],
    );
    setAbierto(true);
  }, []);

  const quitar = useCallback((id: string) => {
    guardarItems(obtenerItems().filter((i) => i.producto.id !== id));
  }, []);

  const cambiarCantidad = useCallback(
    (id: string, cantidad: number) => {
      if (cantidad < 1) return quitar(id);
      guardarItems(obtenerItems().map((i) => (i.producto.id === id ? { ...i, cantidad } : i)));
    },
    [quitar],
  );

  const vaciar = useCallback(() => guardarItems([]), []);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  const valor = useMemo<ContextoCarrito>(
    () => ({
      items,
      cantidadTotal: items.reduce((suma, i) => suma + i.cantidad, 0),
      total: totalCarrito(items),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      abierto,
      abrir,
      cerrar,
    }),
    [items, agregar, cambiarCantidad, quitar, vaciar, abierto, abrir, cerrar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <PanelCarrito />
    </Contexto.Provider>
  );
}

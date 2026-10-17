"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { cargarProductos } from "@/components/busqueda/indiceCliente";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Boton from "@/components/ui/Boton";
import type { Producto } from "@/types/catalogo";
import { useFavoritos } from "./almacenFavoritos";

const sinSuscripcion = () => () => {};

/** Productos marcados con el corazón. Los datos (precio, foto) se piden al catálogo, así siempre están al día. */
export default function ListaFavoritos() {
  const { ids } = useFavoritos();
  const { agregar } = useCarrito();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  // null: el catálogo aún no llega.
  const [catalogo, setCatalogo] = useState<Producto[] | null>(null);
  const [agregados, setAgregados] = useState(false);

  useEffect(() => {
    let vigente = true;
    cargarProductos().then((productos) => vigente && setCatalogo(productos));
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (!agregados) return;
    const t = setTimeout(() => setAgregados(false), 1600);
    return () => clearTimeout(t);
  }, [agregados]);

  // Antes de leer el navegador no se sabe si hay favoritos: esqueletos en vez de "no tienes".
  if (!montado || (ids.length > 0 && catalogo === null)) {
    return <GrillaProductos productos={[]} cargando cantidadEsqueletos={Math.min(Math.max(ids.length, 4), 8)} />;
  }

  const porId = new Map((catalogo ?? []).map((p) => [p.id, p]));
  // Mismo orden que la lista (lo último que guardó, primero). Lo que ya no está en el catálogo no se muestra.
  const productos = ids.map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p));

  if (ids.length > 0 && catalogo?.length === 0) {
    return (
      <p className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-6 text-center text-sm text-gris-texto">
        No pudimos conectar con el catálogo para mostrar tus favoritos. Intenta de nuevo en unos minutos.
      </p>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">
          <Heart className="size-8" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-lg font-bold text-pico-azul">Todavía no tienes favoritos</p>
        <p className="max-w-sm text-sm text-gris-texto">
          Toca el corazón de cualquier producto para guardarlo aquí y encontrarlo rápido cuando vuelvas.
        </p>
        <Boton href="/" className="mt-2">
          Ver productos
        </Boton>
      </div>
    );
  }

  const agregarTodo = () => {
    productos.forEach((p) => agregar(p));
    setAgregados(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gris-texto">
          {productos.length} {productos.length === 1 ? "producto guardado" : "productos guardados"}
        </p>
        <Boton onClick={agregarTodo} className={agregados ? "bg-pico-azul! hover:bg-pico-azul!" : ""}>
          {agregados ? <Check className="size-4" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
          {agregados ? "¡Agregados al carrito!" : "Agregar todo al carrito"}
        </Boton>
      </div>
      <GrillaProductos productos={productos} titulo="Tus favoritos" />
    </div>
  );
}

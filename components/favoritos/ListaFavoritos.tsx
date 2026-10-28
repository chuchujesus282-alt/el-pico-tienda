"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Heart, LayoutGrid, ShoppingCart } from "lucide-react";
import { cargarProductos } from "@/components/busqueda/indiceCliente";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Boton from "@/components/ui/Boton";
import TituloPagina from "@/components/ui/TituloPagina";
import type { Producto } from "@/types/catalogo";
import { useFavoritos } from "./almacenFavoritos";

const sinSuscripcion = () => () => {};

/**
 * Página de favoritos completa: el título (con cuántos hay y "Agregar todo al carrito") y los productos marcados con
 * el corazón. Los datos (precio, foto) se piden al catálogo, así siempre están al día.
 */
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
  const cargando = !montado || (ids.length > 0 && catalogo === null);
  const porId = new Map((catalogo ?? []).map((p) => [p.id, p]));
  // Mismo orden que la lista (lo último que guardó, primero). Lo que ya no está en el catálogo no se muestra.
  const productos = ids.map((id) => porId.get(id)).filter((p): p is Producto => Boolean(p));
  const sinCatalogo = !cargando && ids.length > 0 && catalogo?.length === 0;

  const agregarTodo = () => {
    productos.forEach((p) => agregar(p));
    setAgregados(true);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <TituloPagina
        titulo="Tus favoritos"
        contador={cargando ? undefined : productos.length}
        descripcion="Lo que guardaste con el corazón, listo para cuando lo necesites."
        acciones={
          !cargando &&
          productos.length > 0 && (
            <Boton onClick={agregarTodo} className={`h-11! px-5! ${agregados ? "bg-pico-azul! hover:bg-pico-azul!" : ""}`}>
              {agregados ? <Check className="size-4" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
              {agregados ? "¡Agregados al carrito!" : "Agregar todo al carrito"}
            </Boton>
          )
        }
      />

      {cargando ? (
        <GrillaProductos productos={[]} cargando cantidadEsqueletos={Math.min(Math.max(ids.length, 4), 8)} />
      ) : sinCatalogo ? (
        <p className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-6 text-center text-sm text-gris-texto">
          No pudimos conectar con el catálogo para mostrar tus favoritos. Intenta de nuevo en unos minutos.
        </p>
      ) : productos.length === 0 ? (
        <Vacio />
      ) : (
        <GrillaProductos productos={productos} titulo="Tus favoritos" />
      )}
    </div>
  );
}

/** Sin favoritos: el corazón late sobre un halo y dos salidas (productos o categorías). */
function Vacio() {
  return (
    <div className="relative overflow-hidden rounded-banner bg-pico-blanco px-6 py-14 text-center shadow-tarjeta motion-safe:animate-aparecer md:py-20">
      {/* Halo azul claro de fondo, que sube suave desde abajo. */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-pico-azul-claro/80 to-transparent"
        aria-hidden
      />
      <div className="relative flex flex-col items-center">
        <span className="relative flex size-24 items-center justify-center">
          <span className="absolute inset-1 rounded-chip bg-pico-rojo/10 [animation-duration:2.4s] motion-safe:animate-ping" aria-hidden />
          <span className="relative flex size-20 items-center justify-center rounded-chip bg-pico-blanco text-pico-rojo shadow-tarjeta ring-1 ring-pico-rojo/15">
            <Heart className="size-9 motion-safe:animate-flotar" strokeWidth={1.75} aria-hidden />
          </span>
        </span>
        <h2 className="mt-6 text-2xl font-bold text-pico-azul">Todavía no tienes favoritos</h2>
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-gris-texto">
          Toca el corazón de cualquier producto para guardarlo aquí y encontrarlo rápido cuando vuelvas.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Boton href="/" className="h-12! px-6!">
            Ver productos
          </Boton>
          <Boton href="/categorias" variante="secundario" className="h-12! px-6!">
            <LayoutGrid className="size-4" aria-hidden />
            Ver categorías
          </Boton>
        </div>
      </div>
    </div>
  );
}

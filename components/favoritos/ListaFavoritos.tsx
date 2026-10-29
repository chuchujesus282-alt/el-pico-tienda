"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Heart, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Boton from "@/components/ui/Boton";
import TituloPagina from "@/components/ui/TituloPagina";
import type { Producto } from "@/types/catalogo";
import { obtenerFavoritos, reemplazarFavoritos, useFavoritos } from "./almacenFavoritos";

const sinSuscripcion = () => () => {};
/** Como mucho estos códigos viajan al servidor (lo mismo que acepta /api/favoritos). */
const MAXIMO_FAVORITOS = 200;

type Respuesta = {
  /** Los productos que encontró el servidor, por código. */
  porId: Map<string, Producto>;
  /** Los códigos que se le preguntaron (los que no están en porId no están en el catálogo). */
  pedidos: Set<string>;
  /** false: faltó una parte del catálogo; lo que no llegó no es que ya no exista. */
  completo: boolean;
  /** El servidor no pudo cargar el catálogo. */
  fallo: boolean;
};

/**
 * Página de favoritos completa: el título (con cuántos hay y "Agregar todo al carrito") y los productos marcados con
 * el corazón. Los datos (precio, foto) se piden al servidor solo para los códigos guardados (POST /api/favoritos), así
 * siempre están al día y el navegador no descarga el catálogo.
 */
export default function ListaFavoritos() {
  const { ids } = useFavoritos();
  const { agregar } = useCarrito();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  // null: el servidor aún no responde.
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [agregados, setAgregados] = useState(false);

  // Se pregunta de nuevo solo si aparece un código que no se había preguntado (quitar uno no hace falta pedirlo).
  const nuevos = ids.slice(0, MAXIMO_FAVORITOS).filter((id) => !respuesta?.pedidos.has(id));
  const clave = nuevos.length ? ids.slice(0, MAXIMO_FAVORITOS).join(",") : "";
  useEffect(() => {
    if (!clave) return;
    const pedidos = clave.split(",");
    const control = new AbortController();
    fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: pedidos }),
      signal: control.signal,
    })
      .then(async (r) => {
        const datos = (await r.json()) as { productos?: Producto[]; completo?: boolean };
        setRespuesta({
          porId: new Map((datos.productos ?? []).map((p) => [p.id, p])),
          pedidos: new Set(pedidos),
          completo: datos.completo !== false,
          fallo: !r.ok,
        });
      })
      .catch(() => {
        if (!control.signal.aborted) setRespuesta({ porId: new Map(), pedidos: new Set(pedidos), completo: false, fallo: true });
      });
    return () => control.abort();
  }, [clave]);

  // Con el catálogo completo, los códigos que el servidor no encontró ya no existen: se quitan, así el contador del
  // header dice lo mismo que la página (con sesión, SincronizarCuenta lo copia a la cuenta).
  useEffect(() => {
    if (!respuesta || respuesta.fallo || !respuesta.completo) return;
    const actuales = obtenerFavoritos();
    const vigentes = actuales.filter((id) => !respuesta.pedidos.has(id) || respuesta.porId.has(id));
    if (vigentes.length < actuales.length) reemplazarFavoritos(vigentes);
  }, [respuesta]);

  useEffect(() => {
    if (!agregados) return;
    const t = setTimeout(() => setAgregados(false), 1600);
    return () => clearTimeout(t);
  }, [agregados]);

  // Antes de leer el navegador no se sabe si hay favoritos: esqueletos en vez de "no tienes".
  const cargando = !montado || (ids.length > 0 && (respuesta === null || nuevos.length > 0) && !respuesta?.fallo);
  // Mismo orden que la lista (lo último que guardó, primero). Lo que ya no está en el catálogo no se muestra (y, si el
  // catálogo llegó completo, se quita de la lista; ver arriba).
  const productos = ids.map((id) => respuesta?.porId.get(id)).filter((p): p is Producto => Boolean(p));
  const sinCatalogo = !cargando && ids.length > 0 && respuesta?.fallo === true;
  // Faltó una parte del catálogo y hay favoritos que no llegaron: se avisa en vez de darlos por desaparecidos.
  const incompletos = !cargando && !sinCatalogo && respuesta?.completo === false && productos.length < ids.length;

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
      ) : productos.length === 0 && !incompletos ? (
        <Vacio />
      ) : (
        <>
          {incompletos && (
            <p className="rounded-boton bg-pico-azul-claro px-4 py-3 text-sm text-texto">
              Algunos de tus favoritos no se pudieron cargar en este momento. Vuelve a intentar en unos minutos.
            </p>
          )}
          {productos.length > 0 && <GrillaProductos productos={productos} titulo="Tus favoritos" />}
        </>
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

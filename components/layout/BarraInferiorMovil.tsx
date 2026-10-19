"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House, LayoutGrid, X } from "lucide-react";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import IconoCarrito from "@/components/icons/pico/IconoCarrito";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import IconoUsuario from "@/components/icons/pico/IconoUsuario";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import type { ComponenteIcono } from "@/types/icono";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useFavoritos } from "@/components/favoritos/almacenFavoritos";
import type { Categoria } from "@/types/catalogo";

const subirSuave = () => {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
};

/** Contador rojo sobre el ícono (carrito y favoritos). Late cada vez que cambia. */
function Contador({ valor }: { valor: number }) {
  if (valor <= 0) return null;
  return (
    <span
      key={valor}
      className="absolute top-0 left-[calc(50%+0.3rem)] flex min-w-[18px] items-center justify-center rounded-chip bg-pico-rojo px-1 text-[10px] leading-[18px] font-bold text-pico-blanco tabular-nums ring-2 ring-pico-blanco motion-safe:animate-latido"
    >
      <span className="numero-rodante">{valor > 99 ? "99+" : valor}</span>
    </span>
  );
}

type PropsPestana = {
  icono: ComponenteIcono;
  texto: string;
  activa: boolean;
  contador?: number;
  /** Ícono relleno cuando está activa (el corazón). */
  rellenoActivo?: boolean;
  /** Marca el ícono como destino de la foto que vuela al carrito (`volarAlCarrito`). */
  destinoCarrito?: boolean;
};

/** Nombre de la pestaña: corto y en gris; la activa en azul marino y negrita. */
function Etiqueta({ texto, activa }: { texto: string; activa: boolean }) {
  return (
    <span
      className={`text-[11px] leading-none transition-colors ${
        activa ? "font-bold text-pico-azul" : "font-medium text-gris-texto group-hover:text-pico-azul"
      }`}
    >
      {texto}
    </span>
  );
}

/**
 * Contenido de cada pestaña: ícono fino en gris y su nombre debajo. La activa lleva el ícono en blanco
 * dentro de un círculo azul marino lleno (como la barra de las apps de tiendas).
 */
function Pestana({ icono: Icono, texto, activa, contador = 0, rellenoActivo = false, destinoCarrito = false }: PropsPestana) {
  return (
    <>
      <span
        data-destino-carrito={destinoCarrito || undefined}
        className={`relative flex size-11 items-center justify-center rounded-chip transition duration-300 ease-out ${
          activa
            ? "bg-pico-azul text-pico-blanco shadow-md shadow-pico-azul/30 [--icono-acento:var(--color-pico-blanco)] [--icono-fondo:var(--color-pico-azul)]"
            : "text-gris-texto [--icono-acento:currentColor] group-hover:text-pico-azul"
        }`}
      >
        <Icono
          className={`size-6 transition-transform duration-300 motion-safe:group-active:scale-90 ${
            activa && rellenoActivo ? "fill-pico-blanco" : ""
          }`}
        />
        <Contador valor={contador} />
      </span>
      <Etiqueta texto={texto} activa={activa} />
    </>
  );
}

const clasePestana =
  "group grupo-icono relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-pico-azul rounded-tarjeta";

/**
 * Barra de navegación fija abajo, SOLO en el teléfono (debajo de 768px): Inicio, Categorías, Carrito, Favoritos
 * y Entrar; blanca, con la pestaña activa en un círculo azul marino. Reemplaza en móvil a la barra horizontal de categorías y a las bolas flotantes
 * (subir y carrito). Su alto vive en `--alto-barra-inferior` (globals.css) para que el resto de la
 * página y las barras fijas de producto y calculadoras se acomoden encima.
 */
export default function BarraInferiorMovil({ categorias }: { categorias: Categoria[] }) {
  const ruta = usePathname();
  const { cantidadTotal, abrir: abrirCarrito, abierto: carritoAbierto } = useCarrito();
  const { cantidad: cantidadFavoritos } = useFavoritos();
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [rutaHoja, setRutaHoja] = useState(ruta);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  // Al cambiar de página la hoja de categorías se cierra sola.
  if (rutaHoja !== ruta) {
    setRutaHoja(ruta);
    setHojaAbierta(false);
  }

  useEffect(() => {
    if (!hojaAbierta) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setHojaAbierta(false);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [hojaAbierta]);

  /** Tocar la pestaña de la página en la que ya estás lleva al principio (reemplaza a la flecha de subir). */
  const alTocarEnlace = (href: string) => (e: MouseEvent) => {
    setHojaAbierta(false);
    if (ruta === href) {
      e.preventDefault();
      subirSuave();
    }
  };

  const enCuenta = ruta.startsWith("/iniciar-sesion") || ruta.startsWith("/crear-cuenta");
  const enCategoria = ruta.startsWith("/categoria/");
  // Solo una pestaña activa a la vez: lo que está abierto encima manda sobre la página de fondo.
  const activa = carritoAbierto
    ? "carrito"
    : hojaAbierta
      ? "categorias"
      : ruta === "/"
        ? "inicio"
        : enCategoria
          ? "categorias"
          : ruta === "/favoritos"
            ? "favoritos"
            : enCuenta
              ? "entrar"
              : null;

  const enlace = (href: string, contenido: ReactNode, actual: boolean) => (
    <Link href={href} onClick={alTocarEnlace(href)} aria-current={actual ? "page" : undefined} className={clasePestana}>
      {contenido}
    </Link>
  );

  return (
    <div className="md:hidden print:hidden">
      {/* Hoja de categorías: sube desde la barra y deja la barra visible debajo (tocar "Categorías" otra vez la cierra). */}
      <div
        className={`fixed inset-x-0 top-0 bottom-(--alto-barra-inferior) z-41 ${hojaAbierta ? "" : "pointer-events-none"}`}
        inert={!hojaAbierta}
      >
        <div
          className={`absolute inset-0 bg-pico-azul-oscuro/55 backdrop-blur-[2px] transition-opacity duration-300 ${
            hojaAbierta ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setHojaAbierta(false)}
          aria-hidden
        />
        <div
          id="hoja-categorias"
          role="dialog"
          aria-labelledby="titulo-hoja-categorias"
          className={`absolute inset-x-0 bottom-0 flex max-h-[78dvh] flex-col overflow-hidden rounded-t-banner bg-pico-blanco shadow-tarjeta-hover transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hojaAbierta ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 motion-reduce:translate-y-0"
          }`}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-chip bg-gris-borde" aria-hidden />
          <div className="flex items-center justify-between gap-4 px-5 pt-3 pb-3">
            <div>
              <span className="block h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
              <h2 id="titulo-hoja-categorias" className="mt-2 text-lg font-bold text-pico-azul">
                Categorías
              </h2>
            </div>
            <button
              ref={botonCerrar}
              type="button"
              onClick={() => setHojaAbierta(false)}
              className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-boton text-gris-texto hover:bg-gris-fondo hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
              aria-label="Cerrar categorías"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="overflow-y-auto overscroll-contain px-5 pb-10">
            {categorias.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2.5">
                {categorias.map((categoria, i) => {
                  const href = `/categoria/${categoria.slug}`;
                  const actual = ruta === href;
                  const Icono = iconoDeCategoria(categoria.slug);
                  return (
                    <li
                      key={categoria.slug}
                      className={hojaAbierta ? "motion-safe:animate-aparecer" : ""}
                      style={{ animationDelay: `${60 + i * 30}ms` }}
                    >
                      <Link
                        href={href}
                        onClick={alTocarEnlace(href)}
                        aria-current={actual ? "page" : undefined}
                        className={`group flex h-full flex-col items-center gap-2 rounded-tarjeta border px-1.5 py-3 text-center transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-[0.97] ${
                          actual
                            ? "border-pico-rojo/40 bg-pico-azul-claro"
                            : "border-gris-borde bg-pico-blanco hover:border-pico-azul/30 hover:bg-pico-azul-claro"
                        }`}
                      >
                        <span
                          className={`flex size-11 items-center justify-center rounded-chip transition-colors ${
                            actual
                              ? "bg-pico-rojo text-pico-blanco [--icono-acento:var(--color-pico-blanco)] [--icono-fondo:var(--color-pico-rojo)]"
                              : "bg-pico-azul text-pico-blanco [--icono-fondo:var(--color-pico-azul)] group-hover:bg-pico-rojo group-hover:[--icono-acento:var(--color-pico-blanco)] group-hover:[--icono-fondo:var(--color-pico-rojo)]"
                          }`}
                        >
                          <Icono className="size-7" />
                        </span>
                        <span className="text-xs leading-tight font-semibold text-pico-azul">{categoria.nombre}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-tarjeta bg-gris-fondo p-4 text-center text-sm text-gris-texto">
                No pudimos cargar las categorías. Intenta de nuevo en unos minutos.
              </p>
            )}

            <Link
              href={RUTA_CALCULADORAS}
              onClick={alTocarEnlace(RUTA_CALCULADORAS)}
              className="group mt-3 flex items-center gap-3 rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro p-3 text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-chip bg-pico-blanco/10 ring-1 ring-pico-blanco/15">
                <IconoCalculadora className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Calculadoras de proyectos</span>
                <span className="block text-xs text-pico-blanco/75">Calcula los materiales que necesitas</span>
              </span>
              <ChevronRight className="size-5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Reserva el alto de la barra al final de la página, así el footer no queda tapado. */}
      <div className="h-(--alto-barra-inferior)" aria-hidden />

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-42 border-t border-gris-borde bg-pico-blanco pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-10px_var(--color-pico-azul-oscuro)]"
      >
        <ul className="grid h-16 grid-cols-5 px-1">
          <li>{enlace("/", <Pestana icono={House} texto="Inicio" activa={activa === "inicio"} />, ruta === "/")}</li>
          <li>
            <button
              type="button"
              onClick={() => setHojaAbierta((a) => !a)}
              aria-expanded={hojaAbierta}
              aria-controls="hoja-categorias"
              className={clasePestana}
            >
              <Pestana icono={LayoutGrid} texto="Categorías" activa={activa === "categorias"} />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setHojaAbierta(false);
                abrirCarrito();
              }}
              aria-label={`Carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})`}
              className={clasePestana}
            >
              <Pestana
                icono={IconoCarrito}
                texto="Carrito"
                activa={activa === "carrito"}
                contador={cantidadTotal}
                destinoCarrito
              />
            </button>
          </li>
          <li>
            {enlace(
              "/favoritos",
              <Pestana
                icono={IconoCorazon}
                texto="Favoritos"
                activa={activa === "favoritos"}
                contador={cantidadFavoritos}
                rellenoActivo
              />,
              ruta === "/favoritos",
            )}
          </li>
          <li>{enlace("/iniciar-sesion", <Pestana icono={IconoUsuario} texto="Entrar" activa={activa === "entrar"} />, enCuenta)}</li>
        </ul>
      </nav>
    </div>
  );
}

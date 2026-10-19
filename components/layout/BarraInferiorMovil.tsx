"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid } from "lucide-react";
import IconoCarrito from "@/components/icons/pico/IconoCarrito";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import IconoUsuario from "@/components/icons/pico/IconoUsuario";
import type { ComponenteIcono } from "@/types/icono";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useFavoritos } from "@/components/favoritos/almacenFavoritos";

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
 * Barra de navegación fija abajo, SOLO en el teléfono (debajo de 768px), como la de las apps de tiendas: cada
 * pestaña es una página propia (Inicio `/`, Categorías `/categorias`, Carrito `/carrito`, Favoritos `/favoritos`
 * y Entrar `/iniciar-sesion`); nada se abre encima de la página. Blanca, con la pestaña activa en un círculo azul
 * marino. Reemplaza en móvil a la barra horizontal de categorías y a las bolas flotantes (subir y carrito). Su alto
 * vive en `--alto-barra-inferior` (globals.css) para que el resto de la página y las barras fijas de producto y
 * calculadoras se acomoden encima.
 */
export default function BarraInferiorMovil() {
  const ruta = usePathname();
  const { cantidadTotal } = useCarrito();
  const { cantidad: cantidadFavoritos } = useFavoritos();

  const enCuenta = ruta.startsWith("/iniciar-sesion") || ruta.startsWith("/crear-cuenta");
  const activa =
    ruta === "/"
      ? "inicio"
      : ruta === "/categorias" || ruta.startsWith("/categoria/")
        ? "categorias"
        : ruta === "/carrito"
          ? "carrito"
          : ruta === "/favoritos"
            ? "favoritos"
            : enCuenta
              ? "entrar"
              : null;

  type Datos = {
    id: NonNullable<typeof activa>;
    href: string;
    icono: ComponenteIcono;
    texto: string;
    contador?: number;
    rellenoActivo?: boolean;
    destinoCarrito?: boolean;
  };
  const pestanas: Datos[] = [
    { id: "inicio", href: "/", icono: House, texto: "Inicio" },
    { id: "categorias", href: "/categorias", icono: LayoutGrid, texto: "Categorías" },
    { id: "carrito", href: "/carrito", icono: IconoCarrito, texto: "Carrito", contador: cantidadTotal, destinoCarrito: true },
    { id: "favoritos", href: "/favoritos", icono: IconoCorazon, texto: "Favoritos", contador: cantidadFavoritos, rellenoActivo: true },
    { id: "entrar", href: "/iniciar-sesion", icono: IconoUsuario, texto: "Entrar" },
  ];

  /** Tocar la pestaña de la página en la que ya estás lleva al principio (reemplaza a la flecha de subir). */
  const alTocar = (href: string) => (e: MouseEvent) => {
    if (ruta === href) {
      e.preventDefault();
      subirSuave();
    }
  };

  return (
    <div className="md:hidden print:hidden">
      {/* Reserva el alto de la barra al final de la página, así el footer no queda tapado. */}
      <div className="h-(--alto-barra-inferior)" aria-hidden />

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-42 border-t border-gris-borde bg-pico-blanco pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-10px_var(--color-pico-azul-oscuro)]"
      >
        <ul className="grid h-16 grid-cols-5 px-1">
          {pestanas.map(({ id, href, texto, ...resto }) => (
            <li key={id}>
              <Link
                href={href}
                onClick={alTocar(href)}
                aria-current={activa === id ? "page" : undefined}
                aria-label={id === "carrito" ? `Carrito (${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"})` : undefined}
                className={clasePestana}
              >
                <Pestana texto={texto} activa={activa === id} {...resto} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

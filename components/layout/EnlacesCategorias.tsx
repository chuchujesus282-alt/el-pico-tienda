"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Categoria } from "@/types/catalogo";

const DESVANECIDO = "2rem";

type Marca = { x: number; ancho: number } | null;

export default function EnlacesCategorias({ categorias }: { categorias: Categoria[] }) {
  const ruta = usePathname();
  const lista = useRef<HTMLUListElement>(null);
  // Bordes con contenido oculto: ahí se desvanece la fila para indicar que se puede deslizar.
  const [oculto, setOculto] = useState({ inicio: false, fin: false });
  // Dos píldoras que se deslizan: la roja marca la categoría actual; la tenue sigue al mouse.
  const [actual, setActual] = useState<Marca>(null);
  const [encima, setEncima] = useState<Marca>(null);

  const medirEnlace = useCallback((el: Element | null): Marca => {
    if (!(el instanceof HTMLElement)) return null;
    return { x: el.offsetLeft, ancho: el.offsetWidth };
  }, []);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    const medir = () => {
      setOculto({
        inicio: el.scrollLeft > 4,
        fin: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
      setActual(medirEnlace(el.querySelector('[aria-current="page"]')));
    };
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    el.addEventListener("scroll", medir, { passive: true });
    // La categoría actual siempre queda a la vista en móvil.
    el.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
    return () => {
      observador.disconnect();
      el.removeEventListener("scroll", medir);
    };
  }, [categorias, ruta, medirEnlace]);

  const mascara = `linear-gradient(to right, ${oculto.inicio ? `transparent, black ${DESVANECIDO}` : "black, black"}, ${
    oculto.fin ? `black calc(100% - ${DESVANECIDO}), transparent` : "black, black"
  })`;

  const pildora = (marca: Marca) =>
    marca ? { transform: `translateX(${marca.x}px)`, width: marca.ancho } : { transform: "translateX(0)", width: 0 };

  return (
    // Margen de la página menos el px-3 del enlace: el contenido alinea con el logo y el Contenedor.
    <ul
      ref={lista}
      onMouseLeave={() => setEncima(null)}
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      className={`sin-scrollbar relative mx-auto flex max-w-pagina gap-1 overflow-x-auto px-[calc(var(--margen-pagina)-0.75rem)] py-2 ${
        categorias.length >= 6 ? "xl:justify-between" : ""
      }`}
    >
      {/* Píldora tenue que sigue al mouse y píldora roja de la categoría actual: se deslizan de una a otra. */}
      <li
        aria-hidden
        className={`pointer-events-none absolute top-2 bottom-2 left-0 rounded-boton bg-pico-blanco/10 transition-[transform,width,opacity] duration-300 ease-(--curva-suave) ${
          encima ? "opacity-100" : "opacity-0"
        }`}
        style={pildora(encima)}
      />
      <li
        aria-hidden
        className={`pointer-events-none absolute top-2 bottom-2 left-0 rounded-boton bg-pico-rojo shadow-boton-hover transition-[transform,width,opacity] duration-500 ease-(--curva-suave) ${
          actual ? "opacity-100" : "opacity-0"
        }`}
        style={pildora(actual)}
      />
      {categorias.map((categoria) => {
        const href = `/categoria/${categoria.slug}`;
        const activa = ruta === href;
        return (
          // Sin "relative" en el li: así offsetLeft del enlace se mide desde la lista, donde van las píldoras.
          <li key={categoria.slug} className="shrink-0">
            <Link
              href={href}
              aria-current={activa ? "page" : undefined}
              onMouseEnter={(e) => setEncima(medirEnlace(e.currentTarget))}
              onFocus={(e) => setEncima(medirEnlace(e.currentTarget))}
              onBlur={() => setEncima(null)}
              className={`relative flex items-center rounded-boton px-4 py-2 text-sm leading-5 font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-pico-blanco xl:text-[15px] ${
                activa ? "text-pico-blanco" : "text-pico-blanco/75 hover:text-pico-blanco"
              }`}
            >
              {categoria.nombre}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

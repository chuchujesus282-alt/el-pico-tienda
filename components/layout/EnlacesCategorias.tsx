"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Categoria } from "@/types/catalogo";

const DESVANECIDO = "2rem";

export default function EnlacesCategorias({ categorias }: { categorias: Categoria[] }) {
  const ruta = usePathname();
  const lista = useRef<HTMLUListElement>(null);
  // Bordes con contenido oculto: ahí se desvanece la fila para indicar que se puede deslizar.
  const [oculto, setOculto] = useState({ inicio: false, fin: false });

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    const medir = () =>
      setOculto({
        inicio: el.scrollLeft > 4,
        fin: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    el.addEventListener("scroll", medir, { passive: true });
    // La categoría actual siempre queda a la vista en móvil.
    el.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
    return () => {
      observador.disconnect();
      el.removeEventListener("scroll", medir);
    };
  }, [categorias, ruta]);

  const mascara = `linear-gradient(to right, ${oculto.inicio ? `transparent, black ${DESVANECIDO}` : "black, black"}, ${
    oculto.fin ? `black calc(100% - ${DESVANECIDO}), transparent` : "black, black"
  })`;

  return (
    // px-1 / md:px-3 + px-3 del enlace = 16px / 24px: el texto alinea con el logo y el Contenedor.
    <ul
      ref={lista}
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      className={`sin-scrollbar mx-auto flex max-w-7xl overflow-x-auto px-1 md:px-3 ${
        categorias.length >= 6 ? "xl:justify-between" : "gap-2"
      }`}
    >
      {categorias.map((categoria) => {
        const href = `/categoria/${categoria.slug}`;
        const activa = ruta === href;
        return (
          <li key={categoria.slug} className="shrink-0">
            <Link
              href={href}
              aria-current={activa ? "page" : undefined}
              className={`block border-b-2 px-3 py-3 text-sm leading-5 font-semibold tracking-[0.01em] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-blanco xl:text-[15px] ${
                activa
                  ? "border-pico-blanco text-pico-blanco"
                  : "border-transparent text-pico-blanco/80 hover:border-pico-blanco/40 hover:text-pico-blanco"
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

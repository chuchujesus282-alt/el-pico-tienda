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
    const medir = () => {
      setOculto({
        inicio: el.scrollLeft > 4,
        fin: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
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
  }, [categorias, ruta]);

  const mascara = `linear-gradient(to right, ${oculto.inicio ? `transparent, black ${DESVANECIDO}` : "black, black"}, ${
    oculto.fin ? `black calc(100% - ${DESVANECIDO}), transparent` : "black, black"
  })`;

  return (
    // Margen de la página menos el px-3 del enlace: el contenido alinea con el logo y el Contenedor.
    <ul
      ref={lista}
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      className={`sin-scrollbar relative mx-auto flex max-w-pagina gap-1 overflow-x-auto px-[calc(var(--margen-pagina)-0.75rem)] py-2 ${
        categorias.length >= 6 ? "xl:justify-between" : ""
      }`}
    >
      {categorias.map((categoria) => {
        const href = `/categoria/${categoria.slug}`;
        const activa = ruta === href;
        return (
          <li key={categoria.slug} className="shrink-0">
            {/* El fondo va en el propio enlace: aparece en su sitio (fundido corto), sin deslizarse desde la izquierda.
                Tenue al pasar el mouse o enfocar; rojo en la categoría actual. */}
            <Link
              href={href}
              aria-current={activa ? "page" : undefined}
              className={`relative flex items-center rounded-boton px-4 py-2 text-sm leading-5 font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-pico-blanco xl:text-[15px] ${
                activa
                  ? "bg-pico-rojo text-pico-blanco shadow-boton-hover"
                  : "text-pico-blanco/75 hover:bg-pico-blanco/10 hover:text-pico-blanco focus-visible:bg-pico-blanco/10"
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

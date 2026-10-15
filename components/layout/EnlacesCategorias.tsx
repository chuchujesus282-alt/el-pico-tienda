"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bolt, BrickWall, Car, Droplets, Hammer, HardHat, Package, PaintRoller, Sprout, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Categoria } from "@/types/catalogo";

const DESVANECIDO = "2rem";

/** Ícono de cada categoría (clave: slug). Una categoría nueva sin ícono usa el genérico. */
const ICONOS: Record<string, LucideIcon> = {
  herramientas: Hammer,
  construccion: BrickWall,
  ferreteria: Bolt,
  electricidad: Zap,
  plomeria: Droplets,
  pinturas: PaintRoller,
  "hogar-y-jardin": Sprout,
  "seguridad-industrial": HardHat,
  vehiculos: Car,
};

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
    // Margen de la página menos el px-3 del enlace: el contenido alinea con el logo y el Contenedor.
    <ul
      ref={lista}
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      className={`sin-scrollbar mx-auto flex max-w-pagina gap-1 overflow-x-auto px-[calc(var(--margen-pagina)-0.75rem)] py-2 ${
        categorias.length >= 6 ? "xl:justify-between" : ""
      }`}
    >
      {categorias.map((categoria) => {
        const href = `/categoria/${categoria.slug}`;
        const activa = ruta === href;
        const Icono = ICONOS[categoria.slug] ?? Package;
        return (
          <li key={categoria.slug} className="shrink-0">
            <Link
              href={href}
              aria-current={activa ? "page" : undefined}
              className={`group relative flex items-center gap-2 rounded-boton px-3 py-2 text-sm leading-5 font-semibold tracking-[0.02em] whitespace-nowrap transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-pico-blanco xl:text-[15px] ${
                activa ? "bg-pico-blanco/10 text-pico-blanco" : "text-pico-blanco/80 hover:bg-pico-blanco/5 hover:text-pico-blanco"
              }`}
            >
              {/* Ícono en una placa pequeña: roja en la categoría actual, translúcida en las demás. En laptops (lg a 2xl) se oculta para que quepan las nueve categorías sin deslizar. */}
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-boton transition duration-300 lg:hidden 2xl:flex ${
                  activa ? "bg-pico-rojo text-pico-blanco shadow-boton-hover" : "bg-pico-blanco/10 text-pico-blanco group-hover:bg-pico-rojo"
                }`}
              >
                <Icono className="size-4 motion-safe:group-hover:animate-sacudir" strokeWidth={2} aria-hidden />
              </span>
              {categoria.nombre}
              {/* Subrayado rojo que crece desde la izquierda (lleno en la categoría actual). */}
              <span
                className={`absolute inset-x-3 -bottom-2 h-[3px] origin-left rounded-t-sm bg-pico-rojo transition-transform duration-300 ease-out ${
                  activa ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

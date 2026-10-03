"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Categoria } from "@/types/catalogo";

export default function EnlacesCategorias({ categorias }: { categorias: Categoria[] }) {
  const ruta = usePathname();

  return (
    <ul className="sin-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 md:px-4">
      {categorias.map((categoria) => {
        const href = `/categoria/${categoria.slug}`;
        const activa = ruta === href;
        return (
          <li key={categoria.slug} className="shrink-0">
            <Link
              href={href}
              aria-current={activa ? "page" : undefined}
              className={`block border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                activa
                  ? "border-pico-rojo text-pico-blanco"
                  : "border-transparent text-pico-blanco/85 hover:border-pico-blanco/40 hover:text-pico-blanco"
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

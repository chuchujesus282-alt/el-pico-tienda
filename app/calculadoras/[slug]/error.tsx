"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

/** Si algo falla al abrir la calculadora, la página no se rompe: se puede reintentar. */
export default function ErrorCalculadora({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Contenedor className="py-12 md:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer">
        <span className="flex size-20 items-center justify-center rounded-chip bg-pico-azul-claro">
          <TriangleAlert className="size-10 text-pico-azul" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="font-titulo text-xl font-bold text-pico-azul">No pudimos abrir la calculadora</h1>
        <p className="max-w-sm text-[13px] text-gris-texto">Tuvimos un problema al cargarla. Intenta de nuevo en unos minutos.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-boton bg-pico-azul px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
          >
            <RotateCw className="size-4 transition-transform duration-500 motion-safe:group-hover:rotate-180" aria-hidden />
            Reintentar
          </button>
          <Link
            href="/calculadoras"
            className="inline-flex h-11 items-center rounded-boton border-2 border-pico-azul px-5 text-sm font-semibold text-pico-azul transition duration-200 hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
          >
            Ver calculadoras
          </Link>
        </div>
      </div>
    </Contenedor>
  );
}

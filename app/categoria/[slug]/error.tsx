"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, WifiOff } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

/** Estado "error de conexión con el servidor": la página nunca se rompe. */
export default function ErrorCategoria({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Contenedor className="py-12 md:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer">
        <span className="flex size-20 items-center justify-center rounded-chip bg-logo-marino-claro">
          <WifiOff className="size-10 text-logo-marino" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="text-xl font-bold text-logo-marino">No pudimos cargar los productos</h1>
        <p className="max-w-sm text-[13px] text-gris-texto">
          Estamos teniendo problemas para conectarnos con el catálogo. Intenta de nuevo en unos minutos.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="group inline-flex h-11 items-center gap-2 rounded-boton bg-logo-marino px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-marino-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5"
          >
            <RotateCw className="size-4 transition-transform duration-500 motion-safe:group-hover:rotate-180" aria-hidden />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-boton border-2 border-logo-marino px-5 text-sm font-semibold text-logo-marino transition duration-200 hover:bg-logo-marino hover:text-pico-blanco motion-safe:hover:-translate-y-0.5"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </Contenedor>
  );
}

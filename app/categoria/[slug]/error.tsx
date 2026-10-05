"use client";

import { useEffect } from "react";
import { RotateCw, WifiOff } from "lucide-react";
import Boton from "@/components/ui/Boton";
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
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta">
        <WifiOff className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
        <h1 className="text-xl font-bold text-pico-azul">No pudimos cargar los productos</h1>
        <p className="max-w-sm text-[13px] text-gris-texto">
          Estamos teniendo problemas para conectarnos con el catálogo. Intenta de nuevo en unos minutos.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Boton onClick={() => retry()}>
            <RotateCw className="size-4" aria-hidden />
            Reintentar
          </Boton>
          <Boton href="/" variante="secundario">
            Volver al inicio
          </Boton>
        </div>
      </div>
    </Contenedor>
  );
}

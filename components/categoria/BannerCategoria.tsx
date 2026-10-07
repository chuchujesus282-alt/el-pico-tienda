import Image from "next/image";
import { Package } from "lucide-react";
import type { Categoria } from "@/types/catalogo";

type Props = {
  categoria: Categoria;
  /** Cantidad de productos (con los filtros actuales). */
  total: number;
};

/** Montañas del logo, decorativas (la de la izquierda calada, la de la derecha sólida). */
function Montanas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden>
      <path d="M8 118 L62 28 L116 118 Z M38 102 L62 62 L86 102 Z" fillRule="evenodd" className="fill-pico-blanco/15" />
      <path d="M78 118 L136 4 L194 118 Z" className="fill-logo-rojo" />
    </svg>
  );
}

/** Encabezado de la categoría: título (h1) y cantidad de productos sobre un banner a lo ancho. */
export default function BannerCategoria({ categoria, total }: Props) {
  return (
    <div className="relative isolate overflow-hidden rounded-banner bg-logo-marino">
      {categoria.banner ? (
        <>
          <Image
            src={categoria.banner}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-logo-marino-oscuro/90 via-logo-marino/60 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-logo-marino via-logo-marino to-logo-marino-oscuro" />
          <Montanas className="absolute -right-4 -bottom-1 -z-10 h-[115%] opacity-90 motion-safe:animate-aparecer md:right-10 [animation-delay:200ms]" />
        </>
      )}

      <div className="flex min-h-36 flex-col justify-center gap-2 px-6 py-7 motion-safe:animate-aparecer md:min-h-48 md:px-10">
        <span className="font-titulo text-xs font-semibold tracking-[0.25em] text-pico-blanco/70 uppercase">Categoría</span>
        <h1 className="max-w-[16ch] font-titulo text-3xl leading-none font-bold text-pico-blanco md:text-5xl">{categoria.nombre}</h1>
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-chip bg-pico-blanco/15 px-3 py-1 text-xs font-semibold text-pico-blanco backdrop-blur">
          <Package className="size-3.5" aria-hidden />
          {total} {total === 1 ? "producto" : "productos"}
        </span>
      </div>
    </div>
  );
}

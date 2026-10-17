import Link from "next/link";
import { ChevronRight } from "lucide-react";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import Plano from "@/components/icons/pico/Plano";

/** Banner del inicio que lleva a /calculadoras (mismo estilo que los banners azules). El de las categorías es components/calculadoras/BannerCalculadoras. */
export default function BannerCalculadoras() {
  return (
    <Link
      href="/calculadoras"
      className="group grupo-icono relative flex flex-col gap-4 overflow-hidden rounded-banner bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro p-5 shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between md:px-10 md:py-8"
    >
      <span className="pointer-events-none absolute top-1/2 right-40 hidden -translate-y-1/2 opacity-70 motion-safe:animate-flotar lg:block xl:right-56" aria-hidden>
        <Plano Icono={IconoCalculadora} medidas={["0.60 m", "0.40 m"]} className="w-44 transition-transform duration-700 ease-(--curva-suave) group-hover:scale-105" />
      </span>
      <div className="relative">
        <span className="block h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14" aria-hidden />
        <p className="mt-2 text-xl leading-tight font-bold text-pico-blanco md:text-3xl">Calcula tu proyecto</p>
        <p className="mt-1.5 max-w-xl text-sm text-pico-blanco/80 md:text-base">
          Bloques, cemento, cabillas, pintura y más: descubre cuánto material necesitas y llévate todo en un solo pedido.
        </p>
      </div>
      <span className="relative inline-flex h-10 w-fit shrink-0 items-center gap-1 rounded-boton bg-pico-blanco px-4 text-sm font-semibold text-pico-azul shadow-tarjeta transition duration-200 group-hover:bg-pico-azul-claro group-hover:shadow-boton-hover md:h-12 md:px-6 md:text-base">
        Ver calculadoras
        <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

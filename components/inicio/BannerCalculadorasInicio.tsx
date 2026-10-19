import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import LibretaMateriales from "@/components/calculadoras/LibretaMateriales";

/**
 * Tira del inicio que lleva a /calculadoras: azul cobalto de plano de obra con su cuadrícula de tiza (la paleta
 * ganadora del concurso de colores, "Plano de obra"), la pregunta en grande con subrayado amarillo, la libreta
 * amarilla al centro (más alta que la tira: sobresale como pegada encima) y el botón blanco con letra roja.
 * El de las categorías es components/calculadoras/BannerCalculadoras.
 */
export default function BannerCalculadoras() {
  return (
    <Link
      href={RUTA_CALCULADORAS}
      className="group relative isolate my-4 block rounded-banner shadow-tarjeta transition-shadow duration-200 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pico-azul md:my-6"
    >
      {/* Fondo: el plano (va aparte y recortado, así la libreta puede sobresalir de la tira). */}
      <span className="tira-plano absolute inset-0 -z-10 overflow-hidden rounded-banner" aria-hidden />

      <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] items-center gap-3 py-5 pr-3 pl-5 sm:grid-cols-[minmax(0,1fr)_12rem] md:grid-cols-[minmax(0,1fr)_16rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_17rem_auto] md:py-6 md:pr-8 md:pl-10 lg:gap-12 lg:pl-14">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.18em] text-amarillo-obra uppercase md:text-xs">Calculadoras gratis</p>
          <p className="mt-1.5 leading-[0.95] font-bold text-pico-blanco">
            <span className="block text-base md:text-xl">¿Cuánto material</span>
            <span className="relative mt-0.5 inline-block text-xl tracking-[-0.02em] whitespace-nowrap uppercase sm:text-3xl lg:text-4xl">
              te hace falta?
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-[0.18em] left-0 h-[0.22em] w-full overflow-visible" aria-hidden>
                <path d="M3 9C40 4 82 11 122 6s60-3 75 1" pathLength={1} strokeWidth={5} className="tira-subrayado" />
              </svg>
            </span>
          </p>
          <p className="mt-3 hidden max-w-md text-sm text-pico-blanco/85 sm:block md:text-base">
            Pon las medidas y te decimos cuántos bloques, sacos y cabillas llevar. Lo agregas todo al pedido.
          </p>
          {/* En teléfono y tableta el botón va bajo el texto; desde 1024px, en su propia columna a la derecha. */}
          <span className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-chip bg-pico-blanco px-4 text-sm font-bold text-pico-rojo shadow-tarjeta md:h-11 md:px-5 md:text-base lg:hidden">
            Calcular mi obra
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>

        {/* La libreta sobresale de la tira por arriba y por abajo. */}
        <div className="-my-10 md:-my-12">
          <LibretaMateriales />
        </div>

        <span className="hidden h-12 items-center gap-2 rounded-chip bg-pico-blanco px-6 text-base font-bold whitespace-nowrap text-pico-rojo shadow-tarjeta transition duration-200 group-hover:shadow-boton-hover motion-safe:group-hover:-translate-y-0.5 lg:inline-flex">
          Calcular mi obra
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

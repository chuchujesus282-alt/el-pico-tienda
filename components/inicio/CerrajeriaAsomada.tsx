import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";

// Escena del banner "Cerrajería que protege" del carrusel (persona B, 2026-11-11), con la misma idea que
// HerramientasAsomadas: azul marino con el texto y, cortada en diagonal, una placa de ACERO cepillado (claro) donde
// flota un candado de latón real con sus llaves y, detrás, un candado de acero laminado. Al pasar el mouse asoman una
// cerradura de pomo y un cilindro de seguridad. Fotos del dueño (public/productos/cerrajeria/), recortadas sin fondo
// en public/banners/cerrajeria/. Solo la monta BannerInicio cuando banner.id === "cerrajeria". Movimiento reducido: quieto.

const PLACA = "left-[62%] md:left-[57%] xl:left-[52%]";
const FRANJA = "left-[calc(62%-0.6rem)] md:left-[calc(57%-0.6rem)] xl:left-[calc(52%-0.6rem)]";

export default function CerrajeriaAsomada() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Placa de acero cepillado: degradado gris claro con vetas horizontales finas. */}
        <div
          className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-[#f3f5f8] via-[#dfe4ea] to-[#b8c1cc] shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${PLACA}`}
        >
          <div className="absolute inset-0 skew-x-12 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgb(255_255_255/0.35)_3px,rgb(255_255_255/0.35)_4px)] opacity-60" />
          <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul/[0.06]" />
          <div className="absolute top-1/2 left-[50%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-70" />
        </div>
        {/* Filete rojo de la marca en el corte. */}
        <div className={`absolute -inset-y-6 w-[0.6rem] origin-bottom -skew-x-12 bg-pico-rojo shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${FRANJA}`} />
      </div>

      {/* Asoman al pasar el mouse (desde 768px): la cerradura de pomo abajo, junto al corte (lejos de los controles
          del carrusel), y el cilindro arriba a la derecha. */}
      <div className="absolute right-[31%] bottom-0 hidden w-[15%] max-w-52 translate-y-[60%] rotate-[-8deg] opacity-0 transition duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-hover:translate-y-[18%] group-hover:opacity-100 motion-reduce:transition-none md:block xl:right-[34%]">
        <Image src="/banners/cerrajeria/cerradura-de-pomo.webp" alt="" width={860} height={565} sizes="240px" className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
      </div>
      <div className="absolute top-0 right-[3%] hidden w-[14%] max-w-48 translate-x-[25%] -translate-y-[45%] rotate-[14deg] opacity-0 transition duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-hover:translate-x-0 group-hover:translate-y-[18%] group-hover:opacity-100 group-hover:[transition-delay:120ms] motion-reduce:transition-none md:block">
        <Image src="/banners/cerrajeria/cilindro-seguridad-llave-boton.webp" alt="" width={860} height={594} sizes="192px" className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
      </div>

      {/* Candado de acero laminado, detrás y a la izquierda del protagonista. */}
      <div className="absolute top-1/2 right-[24%] hidden w-[13%] max-w-44 -translate-y-[44%] md:block rotate-[-8deg] transition-transform duration-500 ease-out group-hover:rotate-[-12deg] group-hover:-translate-x-2 motion-reduce:transition-none md:right-[23%] md:w-[11%] lg:right-[26%] lg:w-[10%] xl:right-[28%]">
        <Image
          src="/banners/cerrajeria/visalock-candado-acero-laminado.webp"
          alt=""
          width={540}
          height={855}
          sizes="176px"
          className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/45"
        />
      </div>

      {/* Protagonista: candado de latón con sus llaves, flotando con su sombra. Crece un poco al pasar el mouse. */}
      <div className="absolute top-1/2 right-[4%] w-[26%] max-w-[20rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.05] motion-reduce:transition-none md:w-[22%] lg:right-[9%] lg:w-[18%] xl:right-[11%] xl:w-[19%]">
        <span className="absolute -bottom-[7%] left-1/2 h-[8%] w-[60%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/45 blur-xl" />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/banners/cerrajeria/candado-laton.webp"
            alt=""
            width={777}
            height={859}
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 22vw, 26vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
          />
        </span>
      </div>
    </div>
  );
}

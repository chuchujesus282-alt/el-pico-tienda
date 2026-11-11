import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";

// Escena del banner "Materiales para construir" del carrusel (persona B, 2026-11-11), con la misma idea que
// HerramientasAsomadas: azul marino con el texto y, cortada en diagonal, una placa de CONCRETO (textura real) donde
// descansa una paleta de bloques real, con una paila y un manojo de cabillas. Al pasar el mouse baja una grúa con un
// bloque colgando del gancho, como en la obra. Fotos en public/banners/construccion/ (ver su CREDITOS.md).
// Solo la monta BannerInicio cuando banner.id === "obra". Movimiento reducido: quieto.

// Mismo corte diagonal que la placa de Herramientas (ángulo del filete de la marca).
const PLACA = "left-[62%] md:left-[57%] xl:left-[52%]";
const FRANJA = "left-[calc(62%-1.4rem)] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]";

export default function ObraAsomada() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Placa de concreto. */}
        <div
          className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${PLACA}`}
        >
          <Image src="/banners/construccion/concreto.webp" alt="" fill sizes="50vw" className="skew-x-12 scale-125 object-cover" />
          {/* Sombra hacia el borde y luz detrás de la paleta, para que el concreto no se vea plano. */}
          <div className="absolute inset-0 bg-gradient-to-r from-pico-azul-oscuro/35 via-transparent to-pico-azul-oscuro/10" />
          <div className="absolute top-[55%] left-[55%] aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-35" />
        </div>
        {/* Franja de seguridad amarilla y azul en el corte, como la cinta de "precaución" de la obra. */}
        <div
          className={`absolute -inset-y-6 w-[1.4rem] origin-bottom -skew-x-12 bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)] shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${FRANJA}`}
        />
      </div>

      {/* Grúa: el gancho con un bloque baja desde arriba al pasar el mouse (desde 768px; en el teléfono no cabe). */}
      <div className="absolute top-0 right-[30%] hidden w-[7%] max-w-24 -translate-y-[62%] transition-transform duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] group-hover:-translate-y-[18%] motion-reduce:transition-none md:block lg:right-[33%]">
        <span className="relative block motion-safe:group-hover:animate-flotar">
          <Image src="/banners/construccion/gancho.webp" alt="" width={397} height={900} sizes="96px" className="h-auto w-full" />
          <Image
            src="/banners/construccion/bloque.webp"
            alt=""
            width={397}
            height={900}
            sizes="96px"
            className="absolute inset-0 h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/40"
          />
        </span>
      </div>

      {/* Cabillas apoyadas atrás, a la derecha. */}
      <div className="absolute right-[2%] bottom-[6%] w-[5%] max-w-16 rotate-[8deg] transition-transform duration-500 ease-out group-hover:rotate-[4deg] motion-reduce:transition-none lg:right-[4%]">
        <Image src="/banners/construccion/cabillas.webp" alt="" width={192} height={900} sizes="64px" className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/50" />
      </div>

      {/* Protagonista: la paleta de bloques, con su sombra en el piso. Crece un poco al pasar el mouse. */}
      <div className="absolute right-[6%] bottom-[4%] w-[34%] max-w-[26rem] transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none md:w-[28%] lg:right-[9%] lg:w-[25%] xl:w-[27%]">
        <span className="absolute -bottom-[3%] left-1/2 h-[9%] w-[80%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/55 blur-xl" />
        <Image
          src="/banners/construccion/paleta-bloques.webp"
          alt=""
          width={820}
          height={813}
          sizes="(min-width: 1536px) 416px, (min-width: 768px) 28vw, 34vw"
          className="relative h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
        />
      </div>

      {/* Paila de mezcla delante, a la izquierda de la paleta (desde 768px). */}
      <div className="absolute bottom-[5%] right-[33%] hidden w-[10%] max-w-36 transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none md:block lg:right-[34%] xl:right-[35%]">
        <span className="absolute -bottom-[4%] left-1/2 h-[8%] w-[85%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/50 blur-lg" />
        <Image src="/banners/construccion/paila.webp" alt="" width={578} height={760} sizes="144px" className="relative h-auto w-full drop-shadow-xl" />
      </div>
    </div>
  );
}

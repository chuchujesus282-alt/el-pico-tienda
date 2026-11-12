import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import SenalesProducto, { CALIDAD_BANNER, type Senal } from "./SenalesProducto";

// Escenas del carrusel central para Vehículos, Electricidad, Grifería y Hogar y jardín (persona B, 2026-11-12), con
// las fotos de producto que pasó el dueño (public/banners/categorias/, ver su CREDITOS.md). La rotación puede poner las
// cuatro el mismo día, así que cada una tiene su fondo y su gesto al pasar el mouse:
// - Vehículos: carretera en diagonal; las rayas del canal corren y el aceite se inclina.
// - Electricidad: tablero de acero con el breaker; se "enciende" (luz, cables y piloto verde) y señala sus partes.
// - Grifería: claro como el agua; sale el chorro del grifo, hace ondas y señala sus partes.
// - Hogar y jardín: verde grama con la manguera, que gira y riega gotas.
// Solo las monta BannerInicio (por banner.id). Todo producto queda entero dentro del banner. Movimiento reducido: quietas.

const REBOTE = "transition-[translate,rotate,scale] duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";
const SOMBRA = "drop-shadow-2xl drop-shadow-pico-azul-oscuro/50";

/** Foto que llena el alto de su contenedor (el contenedor lleva la proporción de la foto). */
function Foto({ src, ancho, alto, sizes, className = "" }: { src: string; ancho: number; alto: number; sizes: string; className?: string }) {
  return (
    <Image src={src} alt="" width={ancho} height={alto} sizes={sizes} quality={CALIDAD_BANNER} className={`h-full w-auto max-w-none ${className}`} />
  );
}

function Capa({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {children}
    </div>
  );
}

/* ───────────────────────── Vehículos ───────────────────────── */

const PLACA = "left-[62%] md:left-[57%] xl:left-[52%]";

export function VehiculosEnRuta() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul-oscuro via-pico-azul-oscuro to-texto">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Carretera en diagonal: asfalto, raya blanca del borde y raya amarilla del canal (inclinadas con la placa). Al
            pasar el mouse la raya del canal corre hacia abajo, como vista desde el carro. */}
        <div className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-b from-[#3a4552] to-texto shadow-tarjeta-hover ${PLACA}`}>
          <div className="absolute inset-y-0 left-3 w-1.5 bg-pico-blanco/80" />
          <div className="absolute inset-y-0 left-[44%] w-2.5 bg-[repeating-linear-gradient(to_bottom,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_48px,transparent_48px,transparent_84px)] transition-[background-position] duration-1000 ease-out group-hover:[background-position:0_336px] motion-reduce:transition-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-pico-azul-oscuro/40 via-transparent to-pico-azul-oscuro/30" />
        </div>
        {/* Filete rojo de la marca en el corte. */}
        <div className="absolute -inset-y-6 left-[calc(62%-0.6rem)] w-[0.6rem] origin-bottom -skew-x-12 bg-pico-rojo md:left-[calc(57%-0.6rem)] xl:left-[calc(52%-0.6rem)]" />
      </div>

      {/* El aceite, con un brillo dorado detrás; al pasar el mouse se inclina como para servir. */}
      <div className="absolute top-1/2 right-[7%] aspect-[419/900] h-[80%] -translate-y-1/2 md:right-[12%] lg:right-[16%] xl:right-[19%]">
        <span className="absolute top-1/2 left-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-amarillo-obra)_0%,transparent_60%)] opacity-25" />
        <span className="absolute -bottom-[5%] left-1/2 h-[6%] w-[120%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/60 blur-xl" />
        <span className="relative block h-full motion-safe:animate-levitar">
          <span className={`block h-full origin-bottom group-hover:-rotate-[9deg] ${REBOTE}`}>
            <Foto src="/banners/categorias/aceite.webp" ancho={419} alto={900} sizes="(min-width: 768px) 200px, 30vw" className={SOMBRA} />
          </span>
        </span>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Electricidad ───────────────────────── */

/** Medidos sobre breaker.webp (292×780). */
const SENALES_BREAKER: Senal[] = [
  { texto: "Encendido / apagado", x: 44, y: 31, lado: "izquierda" },
  { texto: "60 amperios", x: 42, y: 43, lado: "izquierda" },
  { texto: "Tornillo de conexión", x: 86, y: 4, lado: "derecha" },
];

/** Tornillo de una esquina del tablero. */
function Tornillo({ className }: { className: string }) {
  return <span className={`absolute size-2.5 rounded-chip bg-gradient-to-br from-[#c3cbd5] to-[#7d8896] shadow-inner md:size-3 ${className}`} />;
}

export function ElectricidadEncendida() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul-oscuro via-pico-azul-oscuro to-texto">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* La luz que se prende al pasar el mouse (un poco prendida siempre, para que no se vea apagado). */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,var(--color-amarillo-obra)_0%,transparent_45%)] opacity-10 transition-opacity duration-700 group-hover:opacity-35" />
      </div>

      {/* Tablero de acero con el breaker al centro y sus dos cables (arriba y abajo). */}
      {/* En el teléfono, más chico y más arriba: el título y el botón ocupan casi todo el ancho. */}
      <div className="absolute top-[40%] right-[4%] aspect-[5/6] h-[64%] -translate-y-1/2 md:top-1/2 md:right-[9%] md:h-[86%] lg:right-[13%] xl:right-[15%]">
        <div className="absolute inset-0 rounded-tarjeta bg-gradient-to-br from-[#f3f5f8] via-[#d9dfe6] to-[#a9b3bf] shadow-tarjeta-hover">
          <div className="absolute inset-0 rounded-tarjeta bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgb(255_255_255/0.35)_3px,rgb(255_255_255/0.35)_4px)] opacity-60" />
          <Tornillo className="top-[5%] left-[6%]" />
          <Tornillo className="top-[5%] right-[6%]" />
          <Tornillo className="bottom-[5%] left-[6%]" />
          <Tornillo className="right-[6%] bottom-[5%]" />
          {/* Piloto: gris apagado; verde con el mouse. */}
          <span className="absolute top-[7%] left-1/2 size-2.5 -translate-x-1/2 rounded-chip bg-[#7d8896] transition duration-500 group-hover:bg-grama-claro group-hover:shadow-[0_0_10px_var(--color-grama-claro)] md:size-3" />
        </div>
        {/* Breaker (centrado) con sus cables; la corriente amarilla los recorre al pasar el mouse. */}
        <div className="absolute top-[14%] left-1/2 aspect-[292/780] h-[76%] -translate-x-1/2">
          <span className="absolute bottom-[99%] left-[83%] h-[20%] w-1 rounded-chip bg-texto" />
          <span className="absolute bottom-[99%] left-[83%] h-[20%] w-1 origin-top scale-y-0 rounded-chip bg-amarillo-obra shadow-[0_0_8px_var(--color-amarillo-obra)] transition-transform duration-500 group-hover:scale-y-100 motion-reduce:transition-none" />
          <span className="absolute top-[97%] left-[44%] h-[14%] w-1 rounded-chip bg-texto" />
          <span className="absolute top-[97%] left-[44%] h-[14%] w-1 origin-top scale-y-0 rounded-chip bg-amarillo-obra shadow-[0_0_8px_var(--color-amarillo-obra)] transition-transform duration-500 group-hover:scale-y-100 group-hover:delay-300 motion-reduce:transition-none" />
          <span className={`relative block h-full group-hover:scale-[1.04] ${REBOTE}`}>
            <Foto src="/banners/categorias/breaker.webp" ancho={292} alto={780} sizes="(min-width: 768px) 160px, 22vw" className="drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
            <SenalesProducto senales={SENALES_BREAKER} />
          </span>
        </div>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Grifería ───────────────────────── */

/** Medidos sobre grifo.webp (281×762). */
const SENALES_GRIFO: Senal[] = [
  { texto: "Ducha extraíble", x: 12, y: 42, lado: "izquierda" },
  { texto: "Acero inoxidable", x: 87, y: 32, lado: "derecha" },
  { texto: "Monomando", x: 57, y: 84, lado: "derecha" },
];

export function GriferiaConAgua() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-blanco via-agua to-agua">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-azul/[0.05]" />
        {/* Halo azul detrás del grifo: el acero no se pierde sobre el fondo claro. */}
        <div className="absolute top-1/2 right-[2%] aspect-square h-[150%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-azul)_0%,transparent_60%)] opacity-15 md:right-[8%] lg:right-[12%]" />
      </div>

      <div className="absolute right-[8%] bottom-[6%] aspect-[281/762] h-[88%] md:right-[14%] lg:right-[19%] xl:right-[22%]">
        <span className="absolute -bottom-[2%] left-[40%] h-[5%] w-[90%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/30 blur-md" />
        {/* Ondas donde cae el agua (debajo de la punta del grifo). */}
        {[
          { w: "w-[45%]", retraso: "group-hover:delay-500" },
          { w: "w-[80%]", retraso: "group-hover:delay-700" },
        ].map((o) => (
          <span
            key={o.w}
            className={`absolute top-[99%] left-[8%] aspect-[4/1] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-[50%] border border-pico-azul/45 opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-none ${o.w} ${o.retraso}`}
          />
        ))}
        <span className="relative block h-full">
          <Foto src="/banners/categorias/grifo.webp" ancho={281} alto={762} sizes="(min-width: 768px) 180px, 26vw" className={SOMBRA} />
          {/* Chorro: sale de la punta del grifo (medida sobre grifo.webp). */}
          <span className="absolute top-[47%] left-[4%] h-0 w-[9%] rounded-b-full bg-gradient-to-b from-pico-azul/60 to-pico-azul/15 transition-[height] duration-700 ease-out group-hover:h-[51%] motion-reduce:transition-none" />
          <SenalesProducto senales={SENALES_GRIFO} />
        </span>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Hogar y jardín ───────────────────────── */

/** Gotas que riega la manguera al pasar el mouse: hacia dónde vuelan (px) y cuándo salen. */
const GOTAS = [
  { dx: -70, dy: -40, t: 0, s: "size-2.5" },
  { dx: -110, dy: -20, t: 80, s: "size-2" },
  { dx: -150, dy: 10, t: 160, s: "size-3" },
  { dx: -95, dy: -70, t: 120, s: "size-2" },
  { dx: -140, dy: -55, t: 220, s: "size-2.5" },
  { dx: -185, dy: -25, t: 280, s: "size-2" },
  { dx: -60, dy: -95, t: 200, s: "size-1.5" },
];

export function JardinConManguera() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-grama via-grama to-grama-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.05]" />
        {/* Sol de la tarde arriba a la derecha. */}
        <div className="absolute -top-[40%] right-[-10%] aspect-square h-[150%] rounded-chip bg-[radial-gradient(circle,var(--color-amarillo-obra)_0%,transparent_60%)] opacity-30" />
        {/* Grama más clara abajo, como el césped. */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-grama-oscuro/60 to-transparent" />
      </div>

      <div className="absolute top-[38%] right-[3%] aspect-[783/900] h-[60%] -translate-y-1/2 md:top-1/2 md:right-[8%] md:h-[84%] lg:right-[12%] xl:right-[14%]">
        <span className="absolute -bottom-[4%] left-1/2 h-[7%] w-[80%] -translate-x-1/2 rounded-chip bg-grama-oscuro/70 blur-xl" />
        <span className={`relative block h-full origin-center group-hover:-rotate-[6deg] group-hover:scale-[1.03] ${REBOTE}`}>
          <Foto src="/banners/categorias/manguera.webp" ancho={783} alto={900} sizes="(min-width: 768px) 360px, 40vw" className={SOMBRA} />
          {/* Gotas desde el acople de abajo (medido sobre manguera.webp). */}
          {GOTAS.map((g) => (
            <span
              key={`${g.dx}${g.dy}`}
              className={`absolute top-[90%] left-[20%] rounded-chip bg-agua opacity-0 shadow-[0_0_6px_var(--color-pico-blanco)] transition-[translate,opacity] duration-700 ease-out group-hover:translate-x-(--dx) group-hover:translate-y-(--dy) group-hover:opacity-90 group-hover:delay-(--t) motion-reduce:hidden ${g.s}`}
              style={{ "--dx": `${g.dx}px`, "--dy": `${g.dy}px`, "--t": `${g.t}ms` } as CSSProperties}
            />
          ))}
        </span>
      </div>
    </Capa>
  );
}

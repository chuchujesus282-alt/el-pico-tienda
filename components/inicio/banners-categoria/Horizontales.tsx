import Image from "next/image";
import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import { CALIDAD_BANNER } from "../SenalesProducto";
import { MarcoHorizontal } from "./Marcos";

// Banners HORIZONTALES (fila de dos del inicio) de cada categoría, con fotos reales (persona B, 2026-11-11). Cada uno
// tiene su propia escena para que no se vean todos iguales; los que la rotación pone juntos el mismo día alternan
// oscuro y claro. Todo producto queda ENTERO dentro del banner. Al pasar el mouse, cada escena hace un gesto corto
// (solo transiciones, quietas con "reducir movimiento"). Fotos en public/banners/ (ver CREDITOS.md de cada carpeta).

const SIZES = "(min-width: 768px) 280px, 40vw";
const MOVER = "transition-[translate,rotate,scale,left] duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";
const FRANJA_OBRA =
  "bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)]";

/** Foto de producto: su alto lo da `className` (en % del banner) y el ancho sale de la foto. */
function Foto({ src, ancho, alto, className, sombra = true, children }: {
  src: string;
  ancho: number;
  alto: number;
  className: string;
  sombra?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className={`absolute ${MOVER} ${className}`}>
      <Image
        src={src}
        alt=""
        width={ancho}
        height={alto}
        sizes={SIZES}
        quality={CALIDAD_BANNER}
        className={`h-full w-auto max-w-none ${sombra ? "drop-shadow-xl drop-shadow-pico-azul-oscuro/45" : ""}`}
      />
      {children}
    </span>
  );
}

/** Construcción: concreto real de fondo, la paleta de bloques apoyada y la cinta de precaución abajo. */
function Construccion() {
  return (
    <MarcoHorizontal
      slug="construccion"
      tono="oscuro"
      fondo="bg-pico-azul-oscuro"
      escena={
        <>
          <Image src="/banners/construccion/concreto-hd.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" quality={CALIDAD_BANNER} className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-r from-pico-azul-oscuro via-pico-azul-oscuro/80 to-pico-azul-oscuro/5" />
          <span className={`absolute inset-x-0 bottom-0 h-2.5 ${FRANJA_OBRA}`} />
          <span className="absolute right-[7%] bottom-[9%] h-[8%] w-[30%] rounded-chip bg-pico-azul-oscuro/60 blur-lg" />
          <Foto
            src="/banners/construccion/paleta-bloques.webp"
            ancho={820}
            alto={813}
            className="right-[4%] bottom-[12%] h-[72%] group-hover:-translate-y-2 md:right-[6%]"
          />
        </>
      }
    />
  );
}

/** Herramientas: fondo claro con un disco amarillo de obra y tres herramientas en abanico que se abre. */
function Herramientas() {
  const base = "absolute bottom-0 left-1/2 h-full -translate-x-1/2 origin-bottom";
  return (
    <MarcoHorizontal
      slug="herramientas"
      tono="claro"
      fondo="bg-gradient-to-br from-pico-blanco via-pico-blanco to-pico-azul-claro"
      escena={
        <>
          {/* En el teléfono, más chico: el título "Herramientas" es largo. */}
          <span className="absolute top-1/2 right-[3%] aspect-square h-[68%] -translate-y-1/2 rounded-full bg-amarillo-obra shadow-tarjeta md:right-[6%] md:h-[92%]" />
          <span className="absolute top-1/2 right-[3%] aspect-square h-[68%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-pico-blanco)_0%,transparent_55%)] opacity-50 md:right-[6%] md:h-[92%]" />
          <span className="absolute right-[10%] bottom-[14%] h-[66%] w-[16%] md:right-[16%] md:bottom-[8%] md:h-[84%] md:w-[22%]">
            <Foto src="/banners/herramientas/llave-tubo.webp" ancho={176} alto={640} className={`${base} -rotate-[18deg] group-hover:-rotate-[28deg]`} />
            <Foto src="/banners/herramientas/llave-ajustable.webp" ancho={150} alto={640} className={`${base} rotate-[18deg] group-hover:rotate-[28deg]`} />
            <Foto src="/banners/herramientas/martillo.webp" ancho={260} alto={640} className={`${base} group-hover:-translate-y-1.5`} />
          </span>
        </>
      }
    />
  );
}

/** Muestras de color del abanico de Pinturas: giro en reposo y al pasar el mouse. */
const MUESTRAS = [
  { color: "bg-pintura-azul", reposo: "-rotate-[24deg]", abierto: "group-hover:-rotate-[31deg]" },
  { color: "bg-pintura-petroleo", reposo: "-rotate-[12deg]", abierto: "group-hover:-rotate-[19deg]" },
  { color: "bg-pintura-mostaza", reposo: "rotate-0", abierto: "group-hover:rotate-0" },
  { color: "bg-pintura-terracota", reposo: "rotate-[12deg]", abierto: "group-hover:rotate-[19deg]" },
];

/** Pinturas: pared clara con un muestrario de colores en abanico detrás de la lata; se abre al pasar el mouse. */
function Pinturas() {
  return (
    <MarcoHorizontal
      slug="pinturas"
      tono="claro"
      fondo="bg-gradient-to-br from-pico-blanco to-pico-azul-claro"
      escena={
        <>
          <span className="absolute top-[14%] right-[19%] aspect-[5/8] h-[56%] md:top-[12%] md:right-[26%] md:h-[62%]">
            {MUESTRAS.map((m) => (
              <span
                key={m.color}
                className={`absolute inset-0 origin-[50%_95%] overflow-hidden rounded-tarjeta bg-pico-blanco p-[7%] pb-[22%] shadow-tarjeta ${m.reposo} ${m.abierto} ${MOVER}`}
              >
                <span className={`block h-full rounded-[4px] ${m.color}`} />
              </span>
            ))}
          </span>
          <span className="absolute right-[5%] bottom-[6%] h-[7%] w-[26%] rounded-chip bg-pico-azul-oscuro/30 blur-md md:right-[9%]" />
          <Foto
            src="/banners/pinturas/lata-terracota.webp"
            ancho={699}
            alto={700}
            className="right-[6%] bottom-[8%] h-[60%] group-hover:-translate-y-1.5 md:right-[10%]"
          />
        </>
      }
    />
  );
}

/** Cerrajería: azul marino con un foco de luz y el candado colgado de su cordón; se mece al pasar el mouse. */
function Cerrajeria() {
  return (
    <MarcoHorizontal
      slug="cerrajeria"
      tono="oscuro"
      fondo="bg-gradient-to-br from-pico-azul to-pico-azul-oscuro"
      escena={
        <>
          <Montanas className="absolute -bottom-10 -left-8 w-[26rem] fill-pico-blanco/[0.04]" />
          <span className="absolute top-1/2 right-[4%] aspect-square h-[130%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-20 md:right-[8%]" />
          {/* Cordón + candado. El contenedor mide lo mismo que ellos (candado al 87 % del alto: 777/859 × 0,87 ≈ 0,787),
              así se mece desde el centro del cordón. */}
          <span className={`absolute top-0 right-[9%] aspect-[787/1000] h-[92%] origin-[41%_0] -rotate-[5deg] group-hover:rotate-[5deg] md:right-[13%] ${MOVER}`}>
            <span className="absolute top-0 left-[41%] h-[14%] w-0.5 bg-pico-blanco/50" />
            <Foto src="/banners/cerrajeria/candado-laton.webp" ancho={777} alto={859} className="top-[13%] left-0 h-[87%]" />
          </span>
        </>
      }
    />
  );
}

/** Vehículos: asfalto oscuro con las rayas amarillas del canal, que corren al pasar el mouse, y el aceite. */
function Vehiculos() {
  return (
    <MarcoHorizontal
      slug="vehiculos"
      tono="oscuro"
      fondo="bg-gradient-to-br from-texto to-pico-azul-oscuro"
      escena={
        <>
          <span className="absolute inset-x-0 bottom-[14%] h-px bg-pico-blanco/20" />
          <span className="absolute inset-x-0 bottom-[7%] h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_36px,transparent_36px,transparent_64px)] transition-[background-position] duration-1000 ease-out group-hover:[background-position:-256px_0] motion-reduce:transition-none" />
          <span className="absolute top-1/2 right-[6%] aspect-square h-[110%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-pico-azul-claro)_0%,transparent_60%)] opacity-15 md:right-[11%]" />
          <Foto
            src="/banners/categorias/aceite.webp"
            ancho={419}
            alto={900}
            className="right-[10%] bottom-[14%] h-[78%] origin-bottom group-hover:-rotate-[6deg] md:right-[15%]"
          />
        </>
      }
    />
  );
}

/** Electricidad: azul marino; al pasar el mouse corre la corriente por el cable y el breaker se ilumina. */
function Electricidad() {
  return (
    <MarcoHorizontal
      slug="electricidad"
      tono="oscuro"
      fondo="bg-gradient-to-br from-pico-azul to-pico-azul-oscuro"
      escena={
        <>
          <span className="absolute top-1/2 right-[4%] aspect-square h-[120%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-amarillo-obra)_0%,transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-35 md:right-[10%]" />
          {/* Cable: tenue en reposo; con el mouse, la corriente amarilla lo recorre hasta el breaker. */}
          <span className="absolute top-[46%] right-[16%] h-0.5 w-[20%] bg-pico-blanco/15 md:right-[20%]" />
          <span className="absolute top-[46%] right-[16%] h-0.5 w-[20%] origin-left scale-x-0 bg-amarillo-obra shadow-[0_0_8px_var(--color-amarillo-obra)] transition-transform duration-700 group-hover:scale-x-100 motion-reduce:transition-none md:right-[20%]" />
          <Foto
            src="/banners/categorias/breaker.webp"
            ancho={292}
            alto={780}
            className="top-[8%] right-[10%] h-[84%] group-hover:-translate-y-1 md:right-[16%]"
          />
        </>
      }
    />
  );
}

/** Grifería: claro como el agua; al pasar el mouse sale el chorro del grifo. */
function Griferia() {
  return (
    <MarcoHorizontal
      slug="griferia"
      tono="claro"
      fondo="bg-gradient-to-b from-pico-blanco to-agua"
      escena={
        <>
          {/* Halo azul detrás (el acero se pierde sobre el fondo claro) y sombra en la base. */}
          <span className="absolute top-1/2 right-[6%] aspect-square h-[115%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-pico-azul)_0%,transparent_62%)] opacity-15 md:right-[12%]" />
          <span className="absolute right-[13%] bottom-[4%] h-[6%] w-[16%] rounded-chip bg-pico-azul-oscuro/35 blur-md md:right-[19%]" />
          <Foto src="/banners/categorias/grifo.webp" ancho={281} alto={762} className="right-[14%] bottom-[6%] h-[88%] md:right-[20%]">
            {/* Chorro: sale de la punta del grifo (medida sobre grifo.webp). */}
            <span className="absolute top-[47%] left-[4%] h-0 w-[9%] rounded-b-full bg-gradient-to-b from-pico-azul/55 to-pico-azul/10 transition-[height] duration-700 ease-out group-hover:h-[50%] motion-reduce:transition-none" />
          </Foto>
        </>
      }
    />
  );
}

/** Hogar y jardín: verde grama con la manguera enrollada, que gira un poco al pasar el mouse. */
function HogarJardin() {
  return (
    <MarcoHorizontal
      slug="hogar-y-jardin"
      tono="oscuro"
      fondo="bg-gradient-to-br from-grama to-grama-oscuro"
      escena={
        <>
          <Montanas className="absolute -bottom-10 -left-8 w-[26rem] fill-pico-blanco/[0.05]" />
          <span className="absolute top-1/2 right-[4%] aspect-square h-[115%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-grama-claro)_0%,transparent_62%)] opacity-40 md:right-[8%]" />
          <Foto
            src="/banners/categorias/manguera.webp"
            ancho={783}
            alto={900}
            className="top-[8%] right-[5%] h-[84%] group-hover:-rotate-[5deg] md:right-[9%]"
          />
        </>
      }
    />
  );
}

export const horizontalesCategoria: Record<string, () => ReactNode> = {
  construccion: Construccion,
  herramientas: Herramientas,
  pinturas: Pinturas,
  cerrajeria: Cerrajeria,
  vehiculos: Vehiculos,
  electricidad: Electricidad,
  griferia: Griferia,
  "hogar-y-jardin": HogarJardin,
};

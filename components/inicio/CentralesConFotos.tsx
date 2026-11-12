import Image from "next/image";
import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import SenalesProducto, { CALIDAD_BANNER, type Senal } from "./SenalesProducto";

// Escenas del carrusel central para Vehículos, Electricidad, Grifería y Hogar y jardín (persona B, 2026-11-12), con
// las fotos de producto que pasó el dueño (public/banners/categorias/, ver su CREDITOS.md). Siguen la línea de
// HerramientasAsomadas, ObraAsomada y CerrajeriaAsomada: el producto flota a la derecha, entero, y al pasar el cursor
// crece un poco y señala sus partes (SenalesProducto, desde 1280px). La rotación puede poner las cuatro el mismo día,
// así que cada una tiene su propio fondo y un detalle propio:
// - Vehículos: carretera en diagonal; las rayas del canal corren.
// - Electricidad: tablero de acero con el breaker; la corriente recorre los cables y el piloto se pone verde.
// - Grifería: claro como el agua; sale el chorro del grifo y hace ondas.
// - Hogar y jardín: verde grama con la manguera.
// - Tornillería: azul con una regla metálica que se corre al pasar el cursor.
// - Seguridad industrial: cinta de precaución cruzada detrás de los guantes, que corre.
// Solo las monta BannerInicio (por banner.id). Movimiento reducido: quietas.

const CRECER =
  "transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none";
const SOMBRA = "drop-shadow-2xl drop-shadow-pico-azul-oscuro/50";
/** Luz suave detrás del producto (blanca: sobre azul o verde, el amarillo se ve sucio). */
const HALO = "rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)]";

/** Foto que llena el alto de su contenedor (el contenedor lleva la proporción de la foto). */
function Foto({ src, ancho, alto, sizes, className = SOMBRA }: { src: string; ancho: number; alto: number; sizes: string; className?: string }) {
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

/** Sombra en el "piso" bajo el producto, para que se note que flota. */
function SombraPiso({ className = "bg-pico-azul-oscuro/50" }: { className?: string }) {
  return <span className={`absolute -bottom-[6%] left-1/2 h-[6%] w-[90%] -translate-x-1/2 rounded-chip blur-xl ${className}`} />;
}

/* ───────────────────────── Vehículos ───────────────────────── */

/** Medidos sobre aceite.webp (419×900). */
const SENALES_ACEITE: Senal[] = [
  { texto: "Sintético 10W-30", x: 30, y: 53, lado: "izquierda" },
  { texto: "Motores a gasolina", x: 27, y: 73, lado: "izquierda" },
  { texto: "Envase de 1 litro", x: 90, y: 86, lado: "derecha" },
];

const PLACA = "left-[62%] md:left-[57%] xl:left-[52%]";

export function VehiculosEnRuta() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul-oscuro to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Carretera en diagonal (mismo corte que las demás placas): asfalto, raya blanca del borde y raya amarilla
            del canal, inclinadas con la placa. Al pasar el cursor la raya del canal corre, como vista desde el carro. */}
        <div
          className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-[#46515e] via-[#333d49] to-texto shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${PLACA}`}
        >
          <div className="absolute inset-y-0 left-4 w-1 bg-pico-blanco/70" />
          <div className="absolute inset-y-0 left-[46%] w-2 bg-[repeating-linear-gradient(to_bottom,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_44px,transparent_44px,transparent_80px)] opacity-90 transition-[background-position] duration-1000 ease-out group-hover:[background-position:0_320px] motion-reduce:transition-none" />
          <div className="absolute inset-y-0 right-28 w-1 bg-pico-blanco/40" />
          {/* Luz desde arriba y sombra abajo: el asfalto no se ve plano. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgb(255_255_255/0.14)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-pico-azul-oscuro/50 to-transparent" />
        </div>
        {/* Filete rojo de la marca en el corte. */}
        <div className="absolute -inset-y-6 left-[calc(62%-0.6rem)] w-[0.6rem] origin-bottom -skew-x-12 bg-pico-rojo shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[calc(57%-0.6rem)] xl:left-[calc(52%-0.6rem)]" />
      </div>

      <div className={`absolute top-1/2 right-[7%] aspect-[419/900] h-[80%] -translate-y-1/2 md:right-[12%] lg:right-[16%] xl:right-[18%] ${CRECER}`}>
        <span className={`absolute top-1/2 left-1/2 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2 opacity-20 ${HALO}`} />
        <SombraPiso className="bg-texto/70" />
        <span className="relative block h-full motion-safe:animate-levitar">
          <Foto src="/banners/categorias/aceite.webp" ancho={419} alto={900} sizes="(min-width: 768px) 200px, 30vw" />
          <SenalesProducto senales={SENALES_ACEITE} />
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
  return (
    <span
      className={`absolute size-2.5 rounded-chip bg-gradient-to-br from-[#dfe4ea] to-[#7d8896] shadow-[inset_0_1px_1px_rgb(0_0_0/0.25)] md:size-3 ${className}`}
    />
  );
}

/** Cable con la corriente amarilla que lo recorre al pasar el cursor. */
function Cable({ className, retraso = "" }: { className: string; retraso?: string }) {
  return (
    <>
      <span className={`absolute w-1 rounded-chip bg-texto ${className}`} />
      <span
        className={`absolute w-1 origin-top scale-y-0 rounded-chip bg-amarillo-obra shadow-[0_0_8px_var(--color-amarillo-obra)] transition-transform duration-500 group-hover:scale-y-100 motion-reduce:transition-none ${retraso} ${className}`}
      />
    </>
  );
}

export function ElectricidadEncendida() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul-oscuro to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
      </div>

      {/* Tablero de acero con el breaker al centro y sus dos cables. En el teléfono, más chico y más arriba: el título
          y el botón ocupan casi todo el ancho. */}
      <div className="absolute top-[40%] right-[4%] aspect-[5/6] h-[64%] -translate-y-1/2 md:top-1/2 md:right-[9%] md:h-[84%] lg:right-[13%] xl:right-[15%]">
        <span className={`absolute top-1/2 left-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2 opacity-15 transition-opacity duration-700 group-hover:opacity-25 ${HALO}`} />
        <SombraPiso />
        <div className={`absolute inset-0 ${CRECER}`}>
          <div className="absolute inset-0 overflow-hidden rounded-tarjeta bg-gradient-to-br from-[#f5f7f9] via-[#dce1e7] to-[#aeb7c2] shadow-tarjeta-hover ring-1 ring-pico-blanco/50">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgb(255_255_255/0.35)_3px,rgb(255_255_255/0.35)_4px)] opacity-60" />
            {/* Brillo en diagonal del acero. */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.5)_45%,transparent_60%)]" />
            <Tornillo className="top-[5%] left-[6%]" />
            <Tornillo className="top-[5%] right-[6%]" />
            <Tornillo className="bottom-[5%] left-[6%]" />
            <Tornillo className="right-[6%] bottom-[5%]" />
            {/* Piloto: gris apagado; verde al pasar el cursor. */}
            <span className="absolute top-[6%] left-1/2 size-2.5 -translate-x-1/2 rounded-chip bg-[#8a95a3] transition duration-500 group-hover:bg-grama-claro group-hover:shadow-[0_0_10px_var(--color-grama-claro)] md:size-3" />
          </div>
          {/* Breaker centrado; los cables salen de sus tornillos hacia el borde del tablero. */}
          <div className="absolute top-[14%] left-1/2 aspect-[292/780] h-[76%] -translate-x-1/2">
            <Cable className="bottom-[99%] left-[83%] h-[19%]" />
            <Cable className="top-[97%] left-[44%] h-[14%]" retraso="group-hover:delay-300" />
            <span className="relative block h-full">
              <Foto
                src="/banners/categorias/breaker.webp"
                ancho={292}
                alto={780}
                sizes="(min-width: 768px) 160px, 22vw"
                className="drop-shadow-xl drop-shadow-pico-azul-oscuro/40"
              />
              <SenalesProducto senales={SENALES_BREAKER} />
            </span>
          </div>
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

      <div className={`absolute right-[8%] bottom-[6%] aspect-[281/762] h-[88%] origin-bottom md:right-[14%] lg:right-[19%] xl:right-[22%] ${CRECER}`}>
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
          <Foto src="/banners/categorias/grifo.webp" ancho={281} alto={762} sizes="(min-width: 768px) 180px, 26vw" />
          {/* Chorro: sale de la punta del grifo (medida sobre grifo.webp), con un brillo blanco al centro. */}
          <span className="absolute top-[47%] left-[4%] h-0 w-[9%] overflow-hidden rounded-b-full bg-gradient-to-b from-pico-azul/60 to-pico-azul/15 transition-[height] duration-700 ease-out group-hover:h-[51%] motion-reduce:transition-none">
            <span className="absolute inset-y-0 left-[35%] w-[20%] bg-gradient-to-b from-pico-blanco/70 to-transparent" />
          </span>
          <SenalesProducto senales={SENALES_GRIFO} />
        </span>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Tornillería ───────────────────────── */

/** Medidos sobre tornillos.webp (627×554). */
const SENALES_TORNILLOS: Senal[] = [
  { texto: "Rosca autorroscante", x: 44, y: 29, lado: "izquierda" },
  { texto: "Punta de broca", x: 95, y: 11, lado: "derecha" },
  { texto: "Cabeza Phillips", x: 58, y: 81, lado: "derecha" },
];

/** Regla de taller: marcas de centímetro y medio centímetro (gradientes repetidos, escritos completos para Tailwind). */
const REGLA_CM =
  "bg-[repeating-linear-gradient(90deg,var(--color-pico-azul-oscuro)_0,var(--color-pico-azul-oscuro)_2px,transparent_2px,transparent_40px)]";
const REGLA_MEDIO =
  "bg-[repeating-linear-gradient(90deg,transparent_0,transparent_20px,var(--color-pico-azul-oscuro)_20px,var(--color-pico-azul-oscuro)_21px,transparent_21px,transparent_40px)]";

export function TornilleriaFirme() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.05]" />
        {/* Disco de luz donde descansan los tornillos. */}
        <div className="absolute top-1/2 right-[2%] aspect-square h-[140%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-20 md:right-[6%] lg:right-[10%]" />
        {/* Regla metálica abajo a la derecha: los tornillos se miden. Al pasar el cursor se corre un poco. */}
        <div className="absolute right-0 bottom-[7%] left-[55%] h-[13%] overflow-hidden rounded-l-tarjeta bg-gradient-to-b from-[#f3f5f8] via-[#dfe4ea] to-[#b8c1cc] shadow-tarjeta-hover transition-transform duration-700 ease-out group-hover:-translate-x-3 motion-reduce:transition-none">
          <div className={`absolute inset-x-0 top-0 h-[45%] ${REGLA_CM}`} />
          <div className={`absolute inset-x-0 top-0 h-[25%] ${REGLA_MEDIO}`} />
        </div>
      </div>

      {/* Los tornillos (sin girar: las etiquetas deben quedar derechas). En el teléfono, más arriba. */}
      <div
        className={`absolute top-[38%] right-[3%] aspect-[627/554] w-[38%] -translate-y-1/2 ${CRECER} md:top-[45%] md:right-[8%] md:w-[30%] lg:right-[12%] lg:w-[26%] xl:right-[15%] xl:w-[25%]`}
      >
        <SombraPiso />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/banners/categorias/tornillos.webp"
            alt=""
            width={627}
            height={554}
            sizes="(min-width: 1536px) 368px, (min-width: 768px) 30vw, 38vw"
            quality={CALIDAD_BANNER}
            className={`h-auto w-full ${SOMBRA}`}
          />
          <SenalesProducto senales={SENALES_TORNILLOS} />
        </span>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Seguridad industrial ───────────────────────── */

/** Medidos sobre guantes.webp (1027×886). */
const SENALES_GUANTES: Senal[] = [
  { texto: "Puntos de PVC antideslizantes", x: 22, y: 50, lado: "izquierda" },
  { texto: "Tejido de algodón", x: 17, y: 80, lado: "izquierda" },
  { texto: "Puño elástico", x: 80, y: 94, lado: "derecha" },
];

const CINTA_PRECAUCION =
  "bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_22px,var(--color-texto)_22px,var(--color-texto)_44px)]";

export function SeguridadProtegido() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul-oscuro via-pico-azul-oscuro to-texto">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Cinta de precaución que cruza detrás de los guantes (se desvanece hacia el texto); al pasar el cursor corre. */}
        <div
          className={`absolute top-[46%] right-[-10%] left-[42%] h-[22%] -translate-y-1/2 -rotate-[8deg] [mask-image:linear-gradient(to_right,transparent,black_30%)] transition-[background-position] duration-1000 ease-out group-hover:[background-position:124px_0] motion-reduce:transition-none ${CINTA_PRECAUCION}`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pico-blanco/15 via-transparent to-pico-azul-oscuro/25" />
        </div>
        <div className="absolute top-1/2 right-[2%] aspect-square h-[140%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-10 md:right-[8%] lg:right-[12%]" />
      </div>

      {/* Los guantes, enteros; en el teléfono, más arriba y más chicos. */}
      <div
        className={`absolute top-[40%] right-[3%] aspect-[1027/886] w-[40%] -translate-y-1/2 md:top-1/2 md:right-[7%] md:w-[34%] lg:right-[11%] lg:w-[27%] xl:right-[13%] xl:w-[28%] ${CRECER}`}
      >
        <SombraPiso />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/banners/categorias/guantes.webp"
            alt=""
            width={1027}
            height={886}
            sizes="(min-width: 1536px) 412px, (min-width: 768px) 34vw, 40vw"
            quality={CALIDAD_BANNER}
            className={`h-auto w-full ${SOMBRA}`}
          />
          <SenalesProducto senales={SENALES_GUANTES} />
        </span>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Hogar y jardín ───────────────────────── */

/** Medidos sobre manguera.webp (783×900). */
const SENALES_MANGUERA: Senal[] = [
  { texto: "3 capas anti-torceduras", x: 54, y: 21, lado: "izquierda" },
  { texto: "Tejido radial", x: 36, y: 47, lado: "izquierda" },
  { texto: "Conexión robusta", x: 80, y: 62, lado: "derecha" },
  { texto: "20 m · 1/2 pulgada", x: 75, y: 85, lado: "derecha" },
];

export function JardinConManguera() {
  return (
    <Capa>
      <div className="absolute inset-0 bg-gradient-to-br from-grama via-grama-oscuro to-grama-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.05]" />
        {/* Luz verde clara detrás de la manguera. */}
        <div className="absolute top-1/2 right-[0%] aspect-square h-[150%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-grama-claro)_0%,transparent_60%)] opacity-35 md:right-[5%] lg:right-[9%]" />
      </div>

      {/* En el teléfono, más chica y más arriba: el título y el botón ocupan casi todo el ancho. */}
      <div className={`absolute top-[38%] right-[3%] aspect-[783/900] h-[60%] -translate-y-1/2 md:top-1/2 md:right-[8%] md:h-[82%] lg:right-[14%] xl:right-[17%] ${CRECER}`}>
        <SombraPiso className="bg-grama-oscuro/80" />
        <span className="relative block h-full motion-safe:animate-levitar">
          <Foto src="/banners/categorias/manguera.webp" ancho={783} alto={900} sizes="(min-width: 768px) 360px, 40vw" />
          <SenalesProducto senales={SENALES_MANGUERA} />
        </span>
      </div>
    </Capa>
  );
}

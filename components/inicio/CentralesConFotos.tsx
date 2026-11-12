import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import SenalesProducto, { CALIDAD_BANNER, type Senal } from "./SenalesProducto";

// Escenas del carrusel central con fotos de producto del dueño (persona B, 2026-11-12): Vehículos, Electricidad,
// Grifería, Hogar y jardín, Tornillería y Seguridad industrial. Fotos en public/banners/categorias/ (ver CREDITOS.md).
// Siguen la línea de HerramientasAsomadas, ObraAsomada y CerrajeriaAsomada: el producto, entero, flota a la derecha; al
// pasar el cursor crece un poco y señala sus partes (SenalesProducto, desde 1280px). El producto NUNCA gira (las
// etiquetas quedarían torcidas).
//
// Acabado común (para que se vean de estudio y no planos):
// - Fondo con luz desde arriba, viñeta en los bordes y grano fino (Acabado).
// - Al quedar activa la diapositiva, el fondo se acerca despacio y el producto entra desde la derecha, desenfocado,
//   y se enfoca (clases entrada-fondo / entrada-producto en globals.css, quietas con "reducir movimiento").
// - Productos de metal o plástico: al pasar el cursor los cruza un reflejo de luz recortado a su forma (Reflejo).
// - Sombra doble bajo el producto: una de contacto, nítida, y otra amplia y difusa (SombraPiso).
//
// La rotación puede poner varias el mismo día, así que cada una tiene su fondo y su detalle propio:
// - Vehículos: carretera en diagonal con luces desenfocadas; las rayas del canal corren.
// - Electricidad: tablero de acero con el breaker; la corriente recorre los cables y el piloto se pone verde.
// - Grifería: claro como el agua, grifo sobre un mesón; sale el chorro y hace ondas.
// - Hogar y jardín: verde grama con luz de sol desenfocada y la manguera.
// - Tornillería: superficie brillante con el reflejo de los tornillos.
// - Seguridad industrial: cinta de precaución cruzada detrás de los guantes, que corre.
// Solo las monta BannerInicio (por banner.id).

const CRECER =
  "transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none";
const SOMBRA = "drop-shadow-2xl drop-shadow-pico-azul-oscuro/50";
const HALO = "rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)]";

/** Grano fino (ruido SVG): le quita lo "plano" a los degradados. */
const GRANO: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

/** Luz desde arriba, viñeta en los bordes y grano. `claro`: versión suave para fondos claros. */
function Acabado({ claro = false }: { claro?: boolean }) {
  return (
    <>
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-10%,var(--color-pico-blanco)_0%,transparent_55%)] ${claro ? "opacity-60" : "opacity-[0.12]"}`}
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_45%,var(--color-pico-azul-oscuro)_100%)] ${claro ? "opacity-15" : "opacity-60"}`}
      />
      <div className={`absolute inset-0 mix-blend-overlay ${claro ? "opacity-[0.12]" : "opacity-[0.18]"}`} style={GRANO} />
    </>
  );
}

/** Fondo de la escena: se acerca despacio al quedar activa la diapositiva. */
function Fondo({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`entrada-fondo absolute inset-0 ${className}`}>{children}</div>;
}

/** Foto que llena el alto de su contenedor (el contenedor lleva la proporción de la foto). */
function Foto({ src, ancho, alto, sizes, className = SOMBRA }: { src: string; ancho: number; alto: number; sizes: string; className?: string }) {
  return (
    <Image src={src} alt="" width={ancho} height={alto} sizes={sizes} quality={CALIDAD_BANNER} className={`block h-full w-auto max-w-none ${className}`} />
  );
}

/** Reflejo de luz que cruza el producto al pasar el cursor, recortado a su forma con la misma foto como máscara. */
function Reflejo({ src }: { src: string }) {
  const mascara = `url(${src})`;
  return (
    <span
      className="absolute inset-0 bg-[linear-gradient(105deg,transparent_38%,rgb(255_255_255/0.55)_50%,transparent_62%)] bg-[length:260%_100%] bg-[position:130%_0] opacity-0 transition-[background-position,opacity] duration-[1300ms] ease-out group-hover:bg-[position:-30%_0] group-hover:opacity-100 motion-reduce:hidden"
      style={{ maskImage: mascara, WebkitMaskImage: mascara, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
    />
  );
}

/** Producto: entra al quedar activa la diapositiva y flota (o queda quieto, `flotar={false}`). */
function Producto({ children, flotar = true }: { children: ReactNode; flotar?: boolean }) {
  return (
    <span className="entrada-producto relative block h-full">
      <span className={`relative block h-full ${flotar ? "motion-safe:animate-levitar" : ""}`}>{children}</span>
    </span>
  );
}

function Capa({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {children}
    </div>
  );
}

/** Sombra doble en el "piso": de contacto (nítida) y ambiental (amplia y difusa). */
function SombraPiso({ tono = "bg-pico-azul-oscuro" }: { tono?: string }) {
  return (
    <>
      <span className={`absolute -bottom-[7%] left-1/2 h-[9%] w-[95%] -translate-x-1/2 rounded-chip opacity-50 blur-2xl ${tono}`} />
      <span className={`absolute -bottom-[3%] left-1/2 h-[3%] w-[60%] -translate-x-1/2 rounded-chip opacity-45 blur-md ${tono}`} />
    </>
  );
}

/** Luces desenfocadas del fondo (bokeh). */
function Bokeh({ luces }: { luces: { x: string; y: string; t: string; c: string }[] }) {
  return luces.map((l) => (
    <span
      key={`${l.x}${l.y}`}
      className={`absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-chip blur-md motion-safe:animate-deriva ${l.c}`}
      style={{ left: l.x, top: l.y, width: l.t }}
    />
  ));
}

/* ───────────────────────── Vehículos ───────────────────────── */

const ACEITE = "/banners/categorias/aceite.webp";
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
      <Fondo className="bg-gradient-to-br from-pico-azul via-pico-azul-oscuro to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Carretera en diagonal (mismo corte que las demás placas): asfalto, raya blanca del borde y raya amarilla
            del canal, inclinadas con la placa. Al pasar el cursor la raya del canal corre, como vista desde el carro. */}
        <div
          className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-[#4a5562] via-[#323c48] to-texto shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${PLACA}`}
        >
          <div className="absolute inset-0 mix-blend-overlay opacity-40" style={GRANO} />
          <div className="absolute inset-y-0 left-4 w-1 bg-pico-blanco/75 shadow-[0_0_6px_rgb(255_255_255/0.4)]" />
          <div className="absolute inset-y-0 left-[46%] w-2 bg-[repeating-linear-gradient(to_bottom,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_44px,transparent_44px,transparent_80px)] opacity-90 shadow-[0_0_10px_rgb(242_183_5/0.25)] transition-[background-position] duration-1000 ease-out group-hover:[background-position:0_320px] motion-reduce:transition-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgb(255_255_255/0.16)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-pico-azul-oscuro/55 to-transparent" />
        </div>
        {/* Filete rojo de la marca en el corte. */}
        <div className="absolute -inset-y-6 left-[calc(62%-0.6rem)] w-[0.6rem] origin-bottom -skew-x-12 bg-pico-rojo shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[calc(57%-0.6rem)] xl:left-[calc(52%-0.6rem)]" />
        {/* Luces de la ciudad, desenfocadas, al fondo de la carretera. */}
        <Bokeh
          luces={[
            { x: "72%", y: "14%", t: "3.5%", c: "bg-amarillo-obra/25" },
            { x: "88%", y: "22%", t: "2.5%", c: "bg-pico-blanco/20" },
            { x: "95%", y: "10%", t: "4%", c: "bg-amarillo-obra/15" },
            { x: "64%", y: "30%", t: "2%", c: "bg-pico-blanco/15" },
          ]}
        />
        <Acabado />
      </Fondo>

      <div className={`absolute top-1/2 right-[7%] aspect-[419/900] h-[80%] -translate-y-1/2 md:right-[12%] lg:right-[16%] xl:right-[18%] ${CRECER}`}>
        <span className={`absolute top-1/2 left-1/2 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2 opacity-20 ${HALO}`} />
        <SombraPiso tono="bg-texto" />
        <Producto>
          <Foto src={ACEITE} ancho={419} alto={900} sizes="(min-width: 768px) 220px, 30vw" />
          <Reflejo src={ACEITE} />
          <SenalesProducto senales={SENALES_ACEITE} />
        </Producto>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Electricidad ───────────────────────── */

const BREAKER = "/banners/categorias/breaker.webp";
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
      className={`absolute size-2.5 rounded-chip bg-gradient-to-br from-[#e6eaef] to-[#7d8896] shadow-[inset_0_1px_1px_rgb(0_0_0/0.25),0_1px_0_rgb(255_255_255/0.6)] md:size-3 ${className}`}
    />
  );
}

/** Cable con la corriente amarilla que lo recorre al pasar el cursor. */
function Cable({ className, retraso = "" }: { className: string; retraso?: string }) {
  return (
    <>
      <span className={`absolute w-1 rounded-chip bg-texto ${className}`} />
      <span
        className={`absolute w-1 origin-top scale-y-0 rounded-chip bg-amarillo-obra shadow-[0_0_10px_var(--color-amarillo-obra)] transition-transform duration-500 group-hover:scale-y-100 motion-reduce:transition-none ${retraso} ${className}`}
      />
    </>
  );
}

export function ElectricidadEncendida() {
  return (
    <Capa>
      <Fondo className="bg-gradient-to-br from-pico-azul via-pico-azul-oscuro to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        <Acabado />
      </Fondo>

      {/* Tablero de acero con el breaker al centro y sus dos cables. En el teléfono, más chico y más arriba: el título
          y el botón ocupan casi todo el ancho. */}
      <div className="absolute top-[40%] right-[4%] aspect-[5/6] h-[64%] -translate-y-1/2 md:top-1/2 md:right-[9%] md:h-[84%] lg:right-[13%] xl:right-[15%]">
        <span className={`absolute top-1/2 left-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2 opacity-15 transition-opacity duration-700 group-hover:opacity-25 ${HALO}`} />
        <Producto flotar={false}>
          <SombraPiso />
          <div className={`absolute inset-0 ${CRECER}`}>
            <div className="absolute inset-0 overflow-hidden rounded-tarjeta bg-gradient-to-br from-[#f5f7f9] via-[#dce1e7] to-[#aeb7c2] shadow-tarjeta-hover ring-1 ring-pico-blanco/60">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgb(255_255_255/0.35)_3px,rgb(255_255_255/0.35)_4px)] opacity-60" />
              <div className="absolute inset-0 mix-blend-overlay opacity-25" style={GRANO} />
              {/* Brillo en diagonal del acero; se corre al pasar el cursor. */}
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.55)_45%,transparent_60%)] bg-[length:200%_100%] bg-[position:60%_0] transition-[background-position] duration-1000 ease-out group-hover:bg-[position:20%_0] motion-reduce:transition-none" />
              <div className="absolute inset-0 rounded-tarjeta shadow-[inset_0_-10px_20px_rgb(20_32_46/0.12)]" />
              <Tornillo className="top-[5%] left-[6%]" />
              <Tornillo className="top-[5%] right-[6%]" />
              <Tornillo className="bottom-[5%] left-[6%]" />
              <Tornillo className="right-[6%] bottom-[5%]" />
              {/* Piloto: gris apagado; verde al pasar el cursor. */}
              <span className="absolute top-[6%] left-1/2 size-2.5 -translate-x-1/2 rounded-chip bg-[#8a95a3] transition duration-500 group-hover:bg-grama-claro group-hover:shadow-[0_0_12px_var(--color-grama-claro)] md:size-3" />
            </div>
            {/* Breaker centrado; los cables salen de sus tornillos hacia el borde del tablero. */}
            <div className="absolute top-[14%] left-1/2 aspect-[292/780] h-[76%] -translate-x-1/2">
              <Cable className="bottom-[99%] left-[83%] h-[19%]" />
              <Cable className="top-[97%] left-[44%] h-[14%]" retraso="group-hover:delay-300" />
              <span className="relative block h-full">
                <Foto src={BREAKER} ancho={292} alto={780} sizes="(min-width: 768px) 170px, 22vw" className="drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
                <Reflejo src={BREAKER} />
                <SenalesProducto senales={SENALES_BREAKER} />
              </span>
            </div>
          </div>
        </Producto>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Grifería ───────────────────────── */

const GRIFO = "/banners/categorias/grifo.webp";
/** Medidos sobre grifo.webp (281×762). */
const SENALES_GRIFO: Senal[] = [
  { texto: "Ducha extraíble", x: 12, y: 42, lado: "izquierda" },
  { texto: "Acero inoxidable", x: 87, y: 32, lado: "derecha" },
  { texto: "Monomando", x: 57, y: 84, lado: "derecha" },
];

export function GriferiaConAgua() {
  return (
    <Capa>
      <Fondo className="bg-gradient-to-br from-pico-blanco via-agua to-agua">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-azul/[0.05]" />
        {/* Halo azul detrás del grifo: el acero no se pierde sobre el fondo claro. */}
        <div className="absolute top-[42%] right-[2%] aspect-square h-[150%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-azul)_0%,transparent_60%)] opacity-[0.13] md:right-[8%] lg:right-[12%]" />
        {/* Mesón blanco donde va el grifo (se desvanece hacia el texto). */}
        <div className="absolute right-0 bottom-0 left-[40%] h-[13%] bg-gradient-to-b from-pico-blanco via-[#eef4f9] to-[#cfdeeb] [mask-image:linear-gradient(to_right,transparent,black_35%)]">
          <div className="absolute inset-x-0 top-0 h-px bg-pico-blanco shadow-[0_1px_3px_rgb(12_45_78/0.12)]" />
        </div>
        <Acabado claro />
      </Fondo>

      <div className={`absolute right-[8%] bottom-[9%] aspect-[281/762] h-[84%] origin-bottom md:right-[14%] lg:right-[19%] xl:right-[22%] ${CRECER}`}>
        <span className="absolute -bottom-[1.5%] left-[48%] h-[4%] w-[70%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/35 blur-sm" />
        <span className="absolute -bottom-[3%] left-[40%] h-[7%] w-[110%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/15 blur-xl" />
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
        <Producto flotar={false}>
          <Foto src={GRIFO} ancho={281} alto={762} sizes="(min-width: 768px) 190px, 26vw" className="drop-shadow-xl drop-shadow-pico-azul-oscuro/30" />
          <Reflejo src={GRIFO} />
          {/* Chorro: sale de la punta del grifo (medida sobre grifo.webp), con un brillo blanco al centro. */}
          <span className="absolute top-[47%] left-[4%] h-0 w-[9%] overflow-hidden rounded-b-full bg-gradient-to-b from-pico-azul/60 to-pico-azul/15 transition-[height] duration-700 ease-out group-hover:h-[51%] motion-reduce:transition-none">
            <span className="absolute inset-y-0 left-[35%] w-[20%] bg-gradient-to-b from-pico-blanco/70 to-transparent" />
          </span>
          <SenalesProducto senales={SENALES_GRIFO} />
        </Producto>
      </div>
    </Capa>
  );
}

/* ───────────────────────── Tornillería ───────────────────────── */

const TORNILLOS = "/banners/categorias/tornillos.webp";
/** Medidos sobre tornillos.webp (627×554). */
const SENALES_TORNILLOS: Senal[] = [
  { texto: "Rosca autorroscante", x: 44, y: 29, lado: "izquierda" },
  { texto: "Punta de broca", x: 95, y: 11, lado: "derecha" },
  { texto: "Cabeza Phillips", x: 58, y: 81, lado: "derecha" },
];

export function TornilleriaFirme() {
  return (
    <Capa>
      <Fondo className="bg-gradient-to-b from-pico-azul via-pico-azul to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.05]" />
        {/* Foco de luz desde arriba sobre los tornillos. */}
        <div className="absolute -top-[30%] right-[4%] aspect-square h-[150%] rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-20 md:right-[8%] lg:right-[12%]" />
        {/* Superficie brillante donde descansan (se desvanece hacia el texto). */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-pico-azul-oscuro/10 to-pico-azul-oscuro/70 [mask-image:linear-gradient(to_right,transparent_25%,black_60%)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pico-blanco/40 to-transparent" />
        </div>
        <Acabado />
      </Fondo>

      {/* Los tornillos, quietos sobre la superficie, con su reflejo abajo. En el teléfono, más arriba. */}
      <div className={`absolute top-[38%] right-[3%] aspect-[627/554] w-[38%] -translate-y-1/2 md:top-[42%] md:right-[8%] md:w-[30%] lg:right-[12%] lg:w-[26%] xl:right-[15%] xl:w-[25%] ${CRECER}`}>
        <Producto flotar={false}>
          {/* Reflejo en la superficie: la misma foto, invertida y desvanecida. */}
          <span className="absolute top-[96%] left-0 block w-full -scale-y-100 opacity-30 blur-[1px] [mask-image:linear-gradient(to_top,black,transparent_45%)]">
            <Image src={TORNILLOS} alt="" width={627} height={554} sizes="(min-width: 768px) 30vw, 38vw" quality={CALIDAD_BANNER} className="h-auto w-full" />
          </span>
          <span className="absolute -bottom-[4%] left-1/2 h-[6%] w-[80%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/60 blur-lg" />
          <span className="relative block">
            <Image
              src={TORNILLOS}
              alt=""
              width={627}
              height={554}
              sizes="(min-width: 1536px) 368px, (min-width: 768px) 30vw, 38vw"
              quality={CALIDAD_BANNER}
              className={`h-auto w-full ${SOMBRA}`}
            />
            <Reflejo src={TORNILLOS} />
            <SenalesProducto senales={SENALES_TORNILLOS} />
          </span>
        </Producto>
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
      <Fondo className="bg-gradient-to-br from-pico-azul via-pico-azul-oscuro to-texto">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Cinta de precaución que cruza detrás de los guantes (se desvanece hacia el texto); al pasar el cursor corre. */}
        <div
          className={`absolute top-[46%] right-[-10%] left-[42%] h-[22%] -translate-y-1/2 -rotate-[8deg] [mask-image:linear-gradient(to_right,transparent,black_30%)] transition-[background-position] duration-1000 ease-out group-hover:[background-position:124px_0] motion-reduce:transition-none ${CINTA_PRECAUCION}`}
        >
          {/* Volumen de la cinta: brillo arriba, sombra abajo y grano de plástico. */}
          <div className="absolute inset-0 bg-gradient-to-b from-pico-blanco/25 via-transparent to-pico-azul-oscuro/35" />
          <div className="absolute inset-0 mix-blend-overlay opacity-30" style={GRANO} />
        </div>
        <div className="absolute top-1/2 right-[2%] aspect-square h-[140%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-10 md:right-[8%] lg:right-[12%]" />
        <Acabado />
      </Fondo>

      {/* Los guantes, enteros; en el teléfono, más arriba y más chicos. */}
      <div className={`absolute top-[40%] right-[3%] aspect-[1027/886] w-[40%] -translate-y-1/2 md:top-1/2 md:right-[7%] md:w-[34%] lg:right-[11%] lg:w-[27%] xl:right-[13%] xl:w-[28%] ${CRECER}`}>
        <SombraPiso />
        <Producto>
          <Image
            src="/banners/categorias/guantes.webp"
            alt=""
            width={1027}
            height={886}
            sizes="(min-width: 1536px) 412px, (min-width: 768px) 34vw, 40vw"
            quality={CALIDAD_BANNER}
            className={`block h-auto w-full ${SOMBRA}`}
          />
          <SenalesProducto senales={SENALES_GUANTES} />
        </Producto>
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
      <Fondo className="bg-gradient-to-br from-grama via-grama-oscuro to-grama-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.05]" />
        {/* Luz verde clara detrás de la manguera. */}
        <div className="absolute top-1/2 right-[0%] aspect-square h-[150%] -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-grama-claro)_0%,transparent_60%)] opacity-35 md:right-[5%] lg:right-[9%]" />
        {/* Sol entre las hojas, desenfocado. */}
        <Bokeh
          luces={[
            { x: "62%", y: "16%", t: "5%", c: "bg-grama-claro/30" },
            { x: "92%", y: "12%", t: "6%", c: "bg-pico-blanco/15" },
            { x: "80%", y: "86%", t: "4%", c: "bg-grama-claro/25" },
            { x: "97%", y: "60%", t: "3%", c: "bg-pico-blanco/15" },
          ]}
        />
        <Acabado />
      </Fondo>

      {/* En el teléfono, más chica y más arriba: el título y el botón ocupan casi todo el ancho. */}
      <div className={`absolute top-[38%] right-[3%] aspect-[783/900] h-[60%] -translate-y-1/2 md:top-1/2 md:right-[8%] md:h-[82%] lg:right-[14%] xl:right-[17%] ${CRECER}`}>
        <SombraPiso tono="bg-grama-oscuro" />
        <Producto>
          <Foto src="/banners/categorias/manguera.webp" ancho={783} alto={900} sizes="(min-width: 768px) 380px, 40vw" />
          <SenalesProducto senales={SENALES_MANGUERA} />
        </Producto>
      </div>
    </Capa>
  );
}

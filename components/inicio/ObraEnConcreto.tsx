import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";
import type { CSSProperties } from "react";

// Escena del banner "Materiales para CONSTRUIR" del carrusel (misma familia que HerramientasAsomadas): azul marino
// para el texto y, cortada en diagonal con el ángulo del filete, una placa de concreto real; en el corte, una
// columna de bloques con sus juntas. Encima flota la paleta de bloques real con un atado de cabillas recostado.
// Solo la monta BannerInicio cuando banner.id === "obra".
// Fotos en public/banners/construccion/ (las comparte el banner de la categoría Construcción de persona B).
//
// - Al pasar el cursor (o con el foco del teclado) la paleta crece un poco y, desde 1280px, se dibuja su cota de
//   alto a tiza y se señalan los materiales.
// - Movimiento reducido: queda quieta.

/** Materiales que se señalan. x/y: el punto, en % de la caja de la paleta. Todas las etiquetas van a la izquierda. */
const SENALES = [
  { texto: "Cabillas", x: -6, y: 34 },
  { texto: "Bloques", x: 20, y: 58 },
];
const COLUMNA = -22;

// Cuadrícula técnica (plano de obra). Escrita completa para que Tailwind la encuentre.
const CUADRICULA_BLANCA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px]";

// Columna de bloques en el corte: caras claras con la junta de mortero, de 34px de alto.
const COLUMNA_BLOQUES =
  "bg-[repeating-linear-gradient(to_bottom,var(--color-gris-borde)_0,var(--color-gris-borde)_30px,var(--color-gris-texto)_30px,var(--color-gris-texto)_34px)]";

// Mismos cortes que el banner de herramientas. En el teléfono, al 66%: deja aire al sello "CONSTRUIR".
const CORTE = "left-[66%] md:left-[57%] xl:left-[52%]";
const CORTE_COLUMNA = "left-[calc(66%-1.4rem)] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]";

function FondoObra({ prioritario }: { prioritario: boolean }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
      <div className={`absolute inset-0 opacity-[0.05] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_right,black_10%,transparent_55%)]`} />
      <div
        className={`absolute -inset-y-6 -right-24 ${CORTE} origin-bottom -skew-x-12 overflow-hidden bg-gris-texto shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%]`}
      >
        {/* Concreto real, enderezado dentro del corte y teñido de azul para que la paleta gris resalte. */}
        <div className="absolute -inset-x-[20%] inset-y-0 skew-x-12">
          <Image
            src="/banners/construccion/concreto.webp"
            alt=""
            fill
            sizes="50vw"
            loading={prioritario ? "eager" : undefined}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-pico-azul-oscuro/45 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-pico-azul-oscuro/50 via-transparent to-pico-azul-oscuro/20" />
        </div>
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-blanco/[0.06]" />
        {/* Luz suave detrás de la paleta. */}
        <div className="absolute top-1/2 left-[45%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-30" />
      </div>
      {/* Columna de bloques en el corte. */}
      <div className={`absolute -inset-y-6 ${CORTE_COLUMNA} w-[1.4rem] origin-bottom -skew-x-12 ${COLUMNA_BLOQUES} shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%]`} />
    </div>
  );
}

/**
 * Cota de alto a tiza a la derecha de la paleta: línea con topes en las puntas y la medida, que se dibuja al pasar
 * el cursor. Solo desde 1280px (más angosto, la tapa la flecha del carrusel). No lleva cota de ancho: debajo de la
 * paleta no cabe sin tocar el borde del banner o los indicadores.
 */
function CotaAlto({ medida }: { medida: string }) {
  return (
    <span className="absolute top-[4%] -right-[7%] hidden h-[84%] w-3 xl:block">
      <span className="absolute inset-y-0 left-1/2 w-0.5 origin-top -translate-x-1/2 scale-y-0 rounded-chip bg-pico-blanco/80 transition-transform duration-500 ease-(--curva-suave) group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none">
        {/* Topes en las dos puntas. */}
        <span className="absolute top-0 -left-1.5 h-0.5 w-3.5 bg-pico-blanco/80" />
        <span className="absolute bottom-0 -left-1.5 h-0.5 w-3.5 bg-pico-blanco/80" />
      </span>
      <span className="absolute top-1/2 left-full ml-1.5 -translate-y-1/2 text-xs font-semibold whitespace-nowrap text-pico-blanco tabular-nums opacity-0 transition-opacity duration-300 [writing-mode:vertical-rl] group-hover:opacity-100 group-hover:delay-300 group-focus-visible:opacity-100">
        {medida}
      </span>
    </span>
  );
}

export default function ObraEnConcreto({ prioritario = false }: { prioritario?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <FondoObra prioritario={prioritario} />

      {/* Protagonista: la paleta de bloques flota a la derecha con las cabillas recostadas detrás. Las cotas y los
          señaladores van DENTRO de lo que flota: así no se despegan de la paleta. */}
      <div className="absolute top-1/2 right-[4%] w-[32%] max-w-[26rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none md:right-[8%] md:w-[28%] lg:top-[45%] lg:right-[9%] lg:w-[23%] xl:top-1/2 xl:right-[10%] xl:w-[26%] 2xl:w-[22%]">
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className="absolute -bottom-[6%] left-1/2 h-[9%] w-[70%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/55 blur-xl" />
        <span className="relative block motion-safe:animate-levitar">
          {/* Atado de cabillas parado a la izquierda, recostado contra la paleta (desde tableta: en el teléfono
              llegaría hasta el sello del título). */}
          <span className="absolute bottom-[6%] -left-[20%] hidden w-[15%] origin-bottom rotate-[8deg] md:block">
            <Image
              src="/banners/construccion/cabillas.webp"
              alt=""
              width={192}
              height={900}
              sizes="(min-width: 1024px) 60px, 40px"
              className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/50"
            />
          </span>
          <Image
            src="/banners/construccion/paleta-bloques.webp"
            alt=""
            width={820}
            height={813}
            sizes="(min-width: 1536px) 330px, (min-width: 1024px) 26vw, (min-width: 768px) 28vw, 32vw"
            loading={prioritario ? "eager" : undefined}
            fetchPriority={prioritario ? "high" : undefined}
            className="relative h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/60"
          />

          <CotaAlto medida="0,90 m" />

          {/* Materiales señalados: punto rojo, línea hasta la columna y etiqueta (solo desde 1280px). */}
          {SENALES.map((s, i) => {
            const retraso = { "--retraso": `${380 + i * 90}ms` } as CSSProperties;
            return (
              <span key={s.texto} className="hidden xl:block" style={retraso}>
                <span
                  className="absolute h-0.5 origin-right -translate-y-1/2 scale-x-0 rounded-chip bg-pico-blanco/80 transition-transform duration-300 group-hover:scale-x-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none"
                  style={{ top: `${s.y}%`, left: `${COLUMNA}%`, width: `${s.x - COLUMNA}%` }}
                />
                <span
                  className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-chip border-2 border-pico-blanco bg-pico-rojo shadow-tarjeta transition-transform duration-300 group-hover:scale-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none"
                  style={{ top: `${s.y}%`, left: `${s.x}%` }}
                />
                <span
                  className="absolute -translate-y-1/2 rounded-chip bg-pico-azul-oscuro px-3 py-1.5 text-[11px] leading-none font-bold tracking-[0.1em] whitespace-nowrap text-pico-blanco uppercase opacity-0 shadow-tarjeta-hover transition-opacity duration-300 group-hover:opacity-100 group-hover:[transition-delay:calc(var(--retraso)+150ms)]"
                  style={{ top: `${s.y}%`, right: `${100 - COLUMNA}%` }}
                >
                  {s.texto}
                </span>
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}

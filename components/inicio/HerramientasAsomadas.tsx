import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";
import type { CSSProperties } from "react";

// Escena del banner "Herramientas que rinden" del carrusel: un rotomartillo real que flota a la derecha sobre una
// placa amarilla de obra, con una cuadrícula tenue. Solo la monta BannerInicio cuando banner.id === "herramientas".
// Foto HD generada con Higgsfield (GPT Image 2.5, calidad alta, 2K, fondo transparente) en public/herramientas/.
//
// - Escritorio: al pasar el cursor el rotomartillo crece un poco y señala sus partes (desde 1280px).
// - Movimiento reducido: queda quieto.

const COLUMNA = { izquierda: 2, derecha: 104 };

/**
 * Partes del rotomartillo que se señalan al pasar el cursor. x/y: el punto, en % de su imagen. columna: dónde
 * termina la línea y empieza la etiqueta (las de un mismo lado comparten columna, así quedan alineadas).
 */
const SENALES: { texto: string; x: number; y: number; lado: "izquierda" | "derecha" }[] = [
  // Medidos sobre rotomartillo.webp (900×757). El mandril va un poco bajo su centro para que la línea no roce la broca.
  { texto: "Mandril SDS", x: 43, y: 17, lado: "izquierda" },
  { texto: "Empuñadura auxiliar", x: 45, y: 58, lado: "izquierda" },
  { texto: "Batería", x: 77, y: 89, lado: "derecha" },
];

// Cuadrícula técnica (plano de taller). Escrita completa para que Tailwind la encuentre.
const CUADRICULA_BLANCA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px]";
const CUADRICULA_AZUL =
  "bg-[linear-gradient(var(--color-pico-azul)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-azul)_1px,transparent_1px)] bg-[size:40px_40px]";

/**
 * Fondo de taller: azul marino para el texto y, cortada en diagonal con el ángulo del filete de la marca, una
 * placa AMARILLO INDUSTRIAL (el color de la señalización de obra) donde el rojo de las herramientas salta a la
 * vista. El corte lleva una franja de seguridad amarilla y azul marino, como la cinta de "precaución".
 */
function FondoTaller() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
      <div className={`absolute inset-0 opacity-[0.05] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_right,black_10%,transparent_55%)]`} />
      <div className="absolute -inset-y-6 -right-24 left-[62%] origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-amarillo-obra via-amarillo-obra to-amarillo-obra-oscuro shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[57%] xl:left-[52%]">
        <div className={`absolute inset-0 skew-x-12 opacity-[0.09] ${CUADRICULA_AZUL}`} />
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul/[0.07]" />
        {/* Luz suave detrás del rotomartillo. */}
        <div className="absolute top-1/2 left-[45%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-40" />
      </div>
      {/* Franja de seguridad en el corte. */}
      <div className="absolute -inset-y-6 left-[calc(62%-1.4rem)] w-[1.4rem] origin-bottom -skew-x-12 bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)] shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]" />
    </div>
  );
}

export default function HerramientasAsomadas() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <FondoTaller />

      {/* Protagonista: un rotomartillo real que flota a la derecha. Se ve siempre; al pasar el cursor crece un poco.
          Flota solo en vertical y los señaladores van DENTRO de lo que flota: así los puntos no se despegan de las
          piezas. */}
      <div className="absolute top-1/2 right-[3%] w-[36%] max-w-[28rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none md:right-[2%] md:w-[30%] lg:right-[7%] lg:w-[25%] xl:right-[8%] xl:w-[30%]">
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className="absolute -bottom-[8%] left-1/2 h-[9%] w-[55%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/45 blur-xl" />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/herramientas/rotomartillo.webp"
            alt=""
            width={900}
            height={757}
            sizes="(min-width: 1536px) 448px, (min-width: 768px) 30vw, 36vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
          />
          {/* Ficha técnica: punto rojo sobre la pieza, línea hasta la columna y etiqueta centrada en la línea.
              Solo desde 1280px: más angosto, las etiquetas de la izquierda pisaban el título. */}
          {SENALES.map((s, i) => {
            const izquierda = s.lado === "izquierda";
            const col = COLUMNA[s.lado];
            const retraso = { "--retraso": `${380 + i * 90}ms` } as CSSProperties;
            return (
              <span key={s.texto} className="hidden xl:block" style={retraso}>
                <span
                  className={`absolute h-0.5 -translate-y-1/2 scale-x-0 rounded-chip bg-pico-azul-oscuro transition-transform duration-300 group-hover:scale-x-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none ${
                    izquierda ? "origin-right" : "origin-left"
                  }`}
                  style={{ top: `${s.y}%`, left: `${Math.min(s.x, col)}%`, width: `${Math.abs(s.x - col)}%` }}
                />
                <span
                  className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-chip border-2 border-pico-blanco bg-pico-rojo shadow-tarjeta transition-transform duration-300 group-hover:scale-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none"
                  style={{ top: `${s.y}%`, left: `${s.x}%` }}
                />
                <span
                  className="absolute -translate-y-1/2 rounded-chip bg-pico-azul-oscuro px-3 py-1.5 text-[11px] leading-none font-bold tracking-[0.1em] whitespace-nowrap text-pico-blanco uppercase opacity-0 shadow-tarjeta-hover transition-opacity duration-300 group-hover:opacity-100 group-hover:[transition-delay:calc(var(--retraso)+150ms)]"
                  style={izquierda ? { top: `${s.y}%`, right: `${100 - col}%` } : { top: `${s.y}%`, left: `${col}%` }}
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

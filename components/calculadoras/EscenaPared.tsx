import type { CSSProperties } from "react";
import LibretaMateriales, { EJEMPLO_PARED } from "./LibretaMateriales";

// Pared de bloques dibujada en el plano (unidades del viewBox). 6 hiladas de bloques trabados.
const X = 24;
const Y = 44;
const ANCHO = 264;
const HILADAS = 6;
const ALTO_HILADA = 26;
const LARGO_BLOQUE = 44;
const ALTO = HILADAS * ALTO_HILADA;
/** El bloque que falta: arriba, en la última hilada (la de arriba), igual que "Lo que te falte" en la libreta. */
const HUECO = { x: X + LARGO_BLOQUE * 3, y: Y, ancho: LARGO_BLOQUE, alto: ALTO_HILADA };

/** Juntas verticales de cada hilada, alternadas medio bloque (trabado). */
function juntas() {
  const lineas: { x: number; y1: number; y2: number }[] = [];
  for (let h = 0; h < HILADAS; h++) {
    const desfase = h % 2 === 0 ? 0 : LARGO_BLOQUE / 2;
    for (let x = X + desfase + LARGO_BLOQUE; x < X + ANCHO; x += LARGO_BLOQUE) {
      lineas.push({ x, y1: Y + h * ALTO_HILADA, y2: Y + (h + 1) * ALTO_HILADA });
    }
  }
  return lineas;
}

/** Retraso de dibujo de cada trazo (para que la pared se "dibuje" de abajo hacia arriba). */
const retraso = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * Ilustración de /calculadoras: la pared de la cuenta dibujada a tiza en el plano, con sus cotas (4 m y 2,5 m, las
 * mismas de la libreta) y el bloque que falta punteado en rojo; encima, la libreta amarilla con las cuentas de esa
 * pared. Al entrar la pared se dibuja hilada por hilada y luego las cotas. Estilos en globals.css (`.escena-*`).
 */
export default function EscenaPared() {
  const medidaLargo = `${EJEMPLO_PARED.largo} m`;
  const medidaAlto = `${EJEMPLO_PARED.alto.toLocaleString("es-VE")} m`;

  return (
    <div className="relative w-full max-w-[26rem]" aria-hidden>
      <svg viewBox="0 0 330 210" className="w-full overflow-visible" fill="none" strokeLinecap="round">
        {/* Contorno de la pared y las hiladas (de abajo hacia arriba). */}
        <rect x={X} y={Y} width={ANCHO} height={ALTO} pathLength={1} className="escena-trazo escena-tiza" strokeWidth={2} style={retraso(0)} />
        {Array.from({ length: HILADAS - 1 }, (_, h) => {
          const y = Y + ALTO - (h + 1) * ALTO_HILADA;
          return (
            <line key={`h${h}`} x1={X} x2={X + ANCHO} y1={y} y2={y} pathLength={1} className="escena-trazo escena-tiza" strokeWidth={1.4} style={retraso(0.25 + h * 0.12)} />
          );
        })}
        {juntas().map(({ x, y1, y2 }) => (
          <line
            key={`j${x}-${y1}`}
            x1={x}
            x2={x}
            y1={y1}
            y2={y2}
            pathLength={1}
            className="escena-trazo escena-tiza escena-junta"
            strokeWidth={1.2}
            style={retraso(0.35 + ((Y + ALTO - y2) / ALTO_HILADA) * 0.12)}
          />
        ))}

        {/* El bloque que falta: fondo del plano encima de las juntas y borde punteado rojo que late. */}
        <rect x={HUECO.x} y={HUECO.y} width={HUECO.ancho} height={HUECO.alto} className="escena-hueco-fondo" />
        <rect x={HUECO.x + 3} y={HUECO.y + 3} width={HUECO.ancho - 6} height={HUECO.alto - 6} rx={2} className="escena-hueco" strokeWidth={2} strokeDasharray="5 4" />

        {/* Cota del largo, arriba (abajo la tapa la libreta). */}
        <g className="escena-cota" style={retraso(1.1)}>
          <line x1={X} x2={X + ANCHO} y1={Y - 18} y2={Y - 18} pathLength={1} className="escena-trazo" strokeWidth={1.4} style={retraso(1.1)} />
          <line x1={X} x2={X} y1={Y - 26} y2={Y - 10} strokeWidth={1.4} />
          <line x1={X + ANCHO} x2={X + ANCHO} y1={Y - 26} y2={Y - 10} strokeWidth={1.4} />
          <text x={X + ANCHO / 2} y={Y - 26} textAnchor="middle" className="escena-texto">
            {medidaLargo}
          </text>
        </g>
        {/* Cota del alto, a la derecha. */}
        <g className="escena-cota" style={retraso(1.3)}>
          <line x1={X + ANCHO + 18} x2={X + ANCHO + 18} y1={Y} y2={Y + ALTO} pathLength={1} className="escena-trazo" strokeWidth={1.4} style={retraso(1.3)} />
          <line x1={X + ANCHO + 10} x2={X + ANCHO + 26} y1={Y} y2={Y} strokeWidth={1.4} />
          <line x1={X + ANCHO + 10} x2={X + ANCHO + 26} y1={Y + ALTO} y2={Y + ALTO} strokeWidth={1.4} />
          <text x={X + ANCHO + 34} y={Y + ALTO / 2} textAnchor="middle" transform={`rotate(90 ${X + ANCHO + 34} ${Y + ALTO / 2})`} className="escena-texto">
            {medidaAlto}
          </text>
        </g>
      </svg>

      {/* La libreta con las cuentas de esta pared, apoyada encima, abajo a la izquierda. */}
      <div className="escena-libreta absolute -bottom-6 -left-6 w-[58%] max-w-60">
        <LibretaMateriales />
      </div>
    </div>
  );
}

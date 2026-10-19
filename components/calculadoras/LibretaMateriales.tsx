import type { CSSProperties } from "react";
import { calcularBloques } from "@/lib/calculadoras/bloques";

// Ejemplo de la libreta: una pared de 4 × 2,5 m de bloque de concreto de 15 cm. Las cantidades NO van escritas a
// mano: salen de la misma calculadora de bloques de la tienda, así siempre coinciden con lo que obtendría el cliente.
export const EJEMPLO_PARED = { largo: 4, alto: 2.5 };
const NOMBRES: Record<string, string> = {
  "bloque-concreto-15": "Bloques de 15",
  cemento: "Cemento",
  arena: "Arena lavada",
};
/** En el teléfono la libreta es angosta: nombres de una palabra para que quepan con su cantidad. */
const NOMBRES_CORTOS: Record<string, string> = {
  "bloque-concreto-15": "Bloques",
  cemento: "Cemento",
  arena: "Arena",
};
const UNIDADES: Record<string, (n: number) => string> = {
  "bloque-concreto-15": (n) => `${n}`,
  cemento: (n) => `${n} ${n === 1 ? "saco" : "sacos"}`,
  arena: (n) => `${n.toLocaleString("es-VE")} m³`,
};

/** Palomita a lápiz rojo; `--i` desfasa su animación (se marcan en cascada). */
function Palomita({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 24 24" className="absolute -top-[35%] -left-[20%] size-[160%] overflow-visible" aria-hidden>
      <path
        d="M3.5 13.5c2 1.2 3.6 3.2 5 5.6C11.6 12.2 15.8 6.6 21.5 2.5"
        pathLength={1}
        strokeWidth={3.4}
        className="libreta-check"
        style={{ "--i": i } as CSSProperties}
      />
    </svg>
  );
}

/**
 * La libreta amarilla del maestro de obra (el concepto "La lista" del concurso): hoja rayada con margen rojo, sujeta
 * con tirro, con las cuentas de la pared. Las palomitas rojas se marcan una tras otra y la última ("Lo que te falte")
 * se queda punteada esperando: eso lo completa el cliente en la calculadora. En bucle; con "reducir movimiento" queda
 * quieta y marcada. Estilos en globals.css (`.libreta`).
 */
export default function LibretaMateriales({ className = "" }: { className?: string }) {
  const { materiales } = calcularBloques({ medidas: EJEMPLO_PARED, opciones: { tipo: "concreto", espesor: "15" } });
  const renglones = materiales.map((m) => ({
    nombre: NOMBRES[m.material] ?? m.material,
    corto: NOMBRES_CORTOS[m.material] ?? m.material,
    cantidad: (UNIDADES[m.material] ?? String)(m.cantidad),
  }));
  const medidas = `${EJEMPLO_PARED.largo} × ${EJEMPLO_PARED.alto.toLocaleString("es-VE")} m`;

  return (
    <div
      className={`libreta relative w-full -rotate-3 px-3 pt-4 pb-3 transition-transform duration-500 ease-(--curva-suave) group-hover:rotate-0 md:px-5 md:pt-6 md:pb-4 ${className}`}
      aria-hidden
    >
      <span className="libreta-tirro absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 md:-top-3 md:h-6 md:w-24" />
      <p className="relative pl-4 text-[9px] font-bold tracking-[0.08em] whitespace-nowrap text-pico-rojo uppercase sm:text-[10px] sm:tracking-[0.16em] md:pl-6 md:text-xs">
        Pared {medidas}
      </p>
      <ul className="relative mt-1.5 space-y-1 pl-4 md:mt-2 md:space-y-1.5 md:pl-6">
        {renglones.map((r, i) => (
          <li key={r.nombre} className="flex items-center gap-2 text-[11px] leading-tight font-semibold text-texto md:gap-2.5 md:text-sm">
            <span className="relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-texto md:size-3.5">
              <Palomita i={i} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="sm:hidden">{r.corto}</span>
              <span className="hidden sm:inline">{r.nombre}</span>
            </span>
            <span className="font-bold whitespace-nowrap tabular-nums">{r.cantidad}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 text-[11px] leading-tight font-bold text-pico-rojo md:gap-2.5 md:text-sm">
          <span className="libreta-falta relative size-3 shrink-0 rounded-[2px] border-[1.5px] border-dashed border-pico-rojo md:size-3.5" />
          Lo que te falte
        </li>
      </ul>
    </div>
  );
}


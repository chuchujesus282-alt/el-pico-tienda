import type { CSSProperties } from "react";

/**
 * Ficha técnica de los banners del carrusel (herramientas, construcción, cerrajería): al pasar el cursor, un punto
 * rojo sobre cada pieza del producto, una línea hasta la columna y la etiqueta. Va DENTRO del contenedor que flota
 * con el producto, así los puntos no se despegan de las piezas. x/y: el punto, en % de la imagen. Solo desde 1280px:
 * más angosto, las etiquetas de la izquierda pisaban el título.
 */
export type Senal = { texto: string; x: number; y: number; lado: "izquierda" | "derecha" };

const COLUMNA = { izquierda: 2, derecha: 104 };

export default function SenalesProducto({ senales }: { senales: Senal[] }) {
  return senales.map((s, i) => {
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
  });
}

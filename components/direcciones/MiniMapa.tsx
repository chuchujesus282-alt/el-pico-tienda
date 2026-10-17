import type { CSSProperties } from "react";
import { posicionEnMosaico } from "@/lib/direcciones";
import type { Ubicacion } from "@/types/cliente";
import { PinMapa } from "./PinMapa";

const ZOOM = 16;

type Props = {
  ubicacion: Ubicacion;
  /** La dirección elegida: su pin late con una onda continua. */
  destacado?: boolean;
  /** Retraso de la caída del pin (ms), para que las tarjetas caigan en cascada. */
  retraso?: number;
  className?: string;
};

/**
 * Miniatura del mapa centrada en el punto, con nuestro pin encima. Son 2×2 mosaicos de OpenStreetMap
 * (imágenes normales, sin librería) colocados para que el punto quede justo en el centro del cuadro.
 * Al aparecer, el pin cae en su lugar y deja una onda; dentro de un `group`, el mapa se acerca un poco al pasar el mouse.
 */
export default function MiniMapa({ ubicacion, destacado = false, retraso = 0, className = "" }: Props) {
  const { x, y, px, py } = posicionEnMosaico(ubicacion, ZOOM);
  // El cuadro mide menos de 256 px: basta con el mosaico del punto y el vecino del lado más cercano.
  const x0 = px < 128 ? x - 1 : x;
  const y0 = py < 128 ? y - 1 : y;
  const puntoX = (x - x0) * 256 + px;
  const puntoY = (y - y0) * 256 + py;
  const demora: CSSProperties = { animationDelay: `${retraso}ms` };

  return (
    <div className={`relative overflow-hidden bg-pico-azul-claro ${className}`} aria-hidden>
      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-110">
        <div className="absolute top-1/2 left-1/2 size-[512px]" style={{ transform: `translate(${-puntoX}px, ${-puntoY}px)` }}>
          {[0, 1].flatMap((fila) =>
            [0, 1].map((columna) => (
              // eslint-disable-next-line @next/next/no-img-element -- mosaicos del mapa: imágenes externas pequeñas, no hace falta optimizarlas
              <img
                key={`${fila}-${columna}`}
                src={`https://tile.openstreetmap.org/${ZOOM}/${x0 + columna}/${y0 + fila}.png`}
                alt=""
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="absolute max-w-none"
                style={{ left: columna * 256, top: fila * 256 }}
              />
            )),
          )}
        </div>
      </div>
      {/* Velo suave abajo: la tarjeta continúa el mapa sin corte duro. */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-pico-blanco/70 to-transparent" />

      {/* Onda en el punto exacto: una al caer el pin; continua si es la dirección elegida. */}
      <span
        className={`absolute top-1/2 left-1/2 -mt-6 -ml-6 size-12 rounded-chip bg-pico-rojo/35 ${destacado ? "motion-safe:animate-ping" : "opacity-0 motion-safe:animate-onda"}`}
        style={{ animationDelay: `${retraso + 350}ms` }}
      />
      <span className="absolute top-1/2 left-1/2 motion-safe:animate-caer" style={demora}>
        <PinMapa className="absolute top-0 left-0 h-10 -translate-x-1/2 -translate-y-full" />
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Calificacion } from "@/types/opiniones";

const ETIQUETAS: Record<Calificacion, string> = {
  1: "Malo",
  2: "Regular",
  3: "Bueno",
  4: "Muy bueno",
  5: "Excelente",
};

type Props = {
  valor: Calificacion | null;
  alCambiar: (valor: Calificacion) => void;
  error?: boolean;
};

/** Cinco estrellas para elegir la calificación (radio accesible con teclado; al pasar el mouse se previsualiza). */
export default function SelectorEstrellas({ valor, alCambiar, error }: Props) {
  const [encima, setEncima] = useState<Calificacion | null>(null);
  const mostrado = encima ?? valor;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-logo-marino">
        Tu calificación <span className="text-logo-rojo">*</span>
      </legend>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex" onPointerLeave={() => setEncima(null)}>
          {([1, 2, 3, 4, 5] as Calificacion[]).map((n) => (
            <label
              key={n}
              className="cursor-pointer p-0.5 has-[:focus-visible]:rounded has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-logo-marino"
              onPointerEnter={() => setEncima(n)}
            >
              <input
                type="radio"
                name="calificacion"
                value={n}
                checked={valor === n}
                onChange={() => alCambiar(n)}
                className="sr-only"
                aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}: ${ETIQUETAS[n]}`}
              />
              <Star
                className={`size-9 transition-transform duration-150 motion-safe:hover:scale-110 ${
                  mostrado && n <= mostrado ? "fill-estrella text-estrella" : error ? "fill-pico-blanco text-logo-rojo/60" : "fill-gris-fondo text-gris-borde"
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
            </label>
          ))}
        </div>
        <span className="min-w-20 font-titulo text-base font-semibold text-logo-marino" aria-hidden>
          {mostrado ? ETIQUETAS[mostrado] : ""}
        </span>
      </div>
    </fieldset>
  );
}

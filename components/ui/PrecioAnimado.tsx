"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import Precio from "./Precio";

const DURACION_MS = 450;

/**
 * Precio que, al cambiar, cuenta desde el monto anterior hasta el nuevo (ease-out en 450 ms) en vez de saltar.
 * Para totales que cambian mientras el cliente decide (finalizar pedido, calculadoras). Con "reducir
 * movimiento" cambia de una vez. Los lectores de pantalla reciben solo el monto final.
 */
export default function PrecioAnimado({ valor, ...resto }: ComponentProps<typeof Precio>) {
  // Monto intermedio mientras cuenta; null cuando no hay animación (se muestra el valor real).
  const [animado, setAnimado] = useState<number | null>(null);
  const anterior = useRef(valor);

  useEffect(() => {
    const desde = anterior.current;
    anterior.current = valor;
    if (desde === valor || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cuadro = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / DURACION_MS);
      const suave = 1 - Math.pow(1 - t, 4);
      if (t < 1) {
        setAnimado(desde + (valor - desde) * suave);
        cuadro = requestAnimationFrame(paso);
      } else {
        setAnimado(null);
      }
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor]);

  return (
    <span className="relative inline-block">
      <span aria-hidden>
        <Precio valor={animado ?? valor} {...resto} />
      </span>
      <span className="sr-only">
        <Precio valor={valor} {...resto} />
      </span>
    </span>
  );
}

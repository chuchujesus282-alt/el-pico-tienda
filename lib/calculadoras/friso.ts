import { PaintbrushVertical } from "lucide-react";
import { CAMPOS_PARED } from "./campos";
import { DESPERDICIO, MORTERO, type MezclaMortero } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { areaPared, materialesMortero, medida, numero } from "./util";

/**
 * Friso (revestimiento de paredes con mortero).
 *   mortero (m³) = área × (espesor en cm ÷ 100) × (1 + desperdicio)
 * El mortero se reparte en cemento y arena según la mezcla elegida (constantes.ts).
 */
export function calcularFriso(entrada: Entrada): Resultado {
  const mezcla = (entrada.opciones.mezcla in MORTERO ? entrada.opciones.mezcla : "1:4") as MezclaMortero;
  const area = areaPared(entrada);
  const espesorCm = medida(entrada, "espesor");
  const mortero = area * (espesorCm / 100) * (1 + DESPERDICIO.mortero);
  return {
    materiales: materialesMortero(mortero, mezcla),
    datos: [
      { etiqueta: "Área a frisar", valor: `${numero(area)} m²` },
      { etiqueta: "Mortero necesario", valor: `${numero(mortero, 3)} m³` },
    ],
  };
}

export const friso: Calculadora = {
  slug: "friso",
  imagen: "/proyectos/friso.webp",
  titulo: "Friso de paredes",
  descripcion: "Cemento y arena para frisar paredes por dentro o por fuera.",
  icono: PaintbrushVertical,
  diagrama: "pared",
  comoMedir: "Mide el largo y el alto de cada cara que vas a frisar. Si frisas los dos lados, suma el largo dos veces.",
  campos: [
    ...CAMPOS_PARED,
    { id: "espesor", etiqueta: "Espesor del friso", unidad: "cm", defecto: 1.5, maximo: 5, ayuda: "Lo normal es entre 1 y 2 cm." },
  ],
  grupos: [
    {
      id: "mezcla",
      etiqueta: "Mezcla (cemento : arena)",
      defecto: "1:4",
      opciones: [
        { valor: "1:3", etiqueta: "1 : 3", detalle: "Exteriores y zonas húmedas." },
        { valor: "1:4", etiqueta: "1 : 4", detalle: "Uso general." },
        { valor: "1:5", etiqueta: "1 : 5", detalle: "Interiores secos." },
      ],
    },
  ],
  herramientas: ["llana", "cuchara", "nivel", "balde", "carretilla", "guantes"],
  materiales: ["cemento", "arena"],
  calcular: calcularFriso,
  explicacion: [
    "Calculamos el área a frisar (largo × alto, menos puertas y ventanas).",
    "La multiplicamos por el espesor del friso para saber cuánta mezcla hace falta, y sumamos 10 % por lo que cae al piso.",
    "Repartimos esa mezcla en cemento y arena según la proporción elegida. Por ejemplo, la mezcla 1 : 4 lleva 364 kg de cemento y 1,16 m³ de arena por cada metro cúbico.",
  ],
};

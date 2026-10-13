import { Layers } from "lucide-react";
import { CAMPOS_SUPERFICIE } from "./campos";
import { DESPERDICIO } from "./constantes";
import { materialesConcreto } from "./concreto";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { materialesMortero, medida, numero } from "./util";

/**
 * Contrapiso o piso de cemento.
 *   volumen (m³) = largo × ancho × (espesor en cm ÷ 100) × (1 + desperdicio)
 * Con piedra se dosifica como concreto de 140 o 175 kg/cm²; sin piedra, como mortero 1:4.
 */
export function calcularContrapiso(entrada: Entrada): Resultado {
  const area = medida(entrada, "largo") * medida(entrada, "ancho");
  const neto = area * (medida(entrada, "espesor") / 100);
  const tipo = entrada.opciones.tipo;
  const esMortero = tipo === "mortero";
  const volumen = neto * (1 + (esMortero ? DESPERDICIO.mortero : DESPERDICIO.concreto));
  return {
    materiales: esMortero ? materialesMortero(volumen, "1:4") : materialesConcreto(volumen, tipo === "175" ? "175" : "140"),
    datos: [
      { etiqueta: "Área del piso", valor: `${numero(area)} m²` },
      { etiqueta: "Volumen de mezcla", valor: `${numero(volumen)} m³` },
    ],
  };
}

export const contrapiso: Calculadora = {
  slug: "contrapiso",
  titulo: "Contrapiso y piso de cemento",
  descripcion: "Cemento, arena y piedra para la base del piso o un piso de cemento.",
  icono: Layers,
  diagrama: "volumen",
  comoMedir: "Mide el largo y el ancho del piso, y decide el espesor de la capa.",
  campos: [
    ...CAMPOS_SUPERFICIE,
    { id: "espesor", etiqueta: "Espesor", unidad: "cm", defecto: 8, maximo: 50, ayuda: "Contrapiso: 8 a 10 cm. Sobrepiso de mortero: 3 a 5 cm." },
  ],
  grupos: [
    {
      id: "tipo",
      etiqueta: "Tipo de piso",
      defecto: "140",
      opciones: [
        { valor: "140", etiqueta: "Contrapiso", detalle: "Concreto de 140 kg/cm², base para cerámica." },
        { valor: "175", etiqueta: "Piso de concreto", detalle: "175 kg/cm², para dejarlo como piso." },
        { valor: "mortero", etiqueta: "Sobrepiso de mortero", detalle: "Sin piedra, para nivelar y alisar." },
      ],
    },
  ],
  herramientas: ["pala", "carretilla", "llana", "nivel", "balde", "guantes"],
  materiales: ["cemento", "arena", "piedra"],
  calcular: calcularContrapiso,
  explicacion: [
    "Calculamos el volumen de mezcla: largo × ancho × espesor.",
    "Sumamos el desperdicio: 5 % si es concreto y 10 % si es mortero.",
    "El contrapiso y el piso de concreto llevan cemento, arena y piedra. El sobrepiso de mortero lleva solo cemento y arena (1 parte de cemento por 4 de arena).",
  ],
};

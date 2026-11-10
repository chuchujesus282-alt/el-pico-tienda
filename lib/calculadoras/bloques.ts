import IconoBloques from "@/components/icons/pico/IconoBloques";
import { CAMPOS_PARED } from "./campos";
import { BLOQUES, DESPERDICIO, MEZCLA_PEGA_BLOQUES } from "./constantes";
import type { IdMaterial } from "./materiales";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { areaPared, haciaArriba, materialesMortero, numero } from "./util";

/**
 * Bloques para paredes y su mortero de pega.
 *   bloques por m² = 1 ÷ ((largo del bloque + junta) × (alto del bloque + junta))
 *   bloques        = área × bloques por m² × (1 + desperdicio)
 *   mortero (m³)   = área × espesor de la pared × (parte de la pared que es junta) × (1 + desperdicio)
 *     donde parte que es junta = 1 − bloques por m² × largo × alto del bloque
 * El mortero se reparte en cemento y arena con la mezcla 1:4 (constantes.ts).
 */
/** Espesores (cm) que vende la tienda de cada tipo de bloque. */
const ESPESORES = { arcilla: [10, 12, 15], concreto: [10, 12, 15, 20] } as const;

export function calcularBloques(entrada: Entrada): Resultado {
  const tipo = entrada.opciones.tipo === "concreto" ? "concreto" : "arcilla";
  const pedido = Number(entrada.opciones.espesor) || 15;
  // Si llega un espesor que no hay de ese tipo, el más cercano que sí hay.
  const espesorCm = (ESPESORES[tipo] as readonly number[]).includes(pedido)
    ? pedido
    : [...ESPESORES[tipo]].sort((a, b) => Math.abs(a - pedido) - Math.abs(b - pedido))[0];
  const { largoM, altoM } = BLOQUES[tipo];
  const area = areaPared(entrada);

  const porM2 = 1 / ((largoM + BLOQUES.juntaM) * (altoM + BLOQUES.juntaM));
  const bloques = area * porM2 * (1 + DESPERDICIO.bloques);
  const parteJunta = 1 - porM2 * largoM * altoM;
  const mortero = area * (espesorCm / 100) * parteJunta * (1 + DESPERDICIO.mortero);

  return {
    materiales: [
      {
        material: `bloque-${tipo}-${espesorCm}` as IdMaterial,
        cantidad: haciaArriba(bloques),
        nota: `${numero(area)} m² × ${numero(porM2)} bloques/m² + ${DESPERDICIO.bloques * 100} % = ${numero(bloques, 1)}`,
      },
      ...materialesMortero(mortero, MEZCLA_PEGA_BLOQUES),
    ],
    datos: [
      { etiqueta: "Área de pared", valor: `${numero(area)} m²` },
      { etiqueta: "Bloques por m²", valor: numero(porM2, 1) },
      { etiqueta: "Mortero de pega", valor: `${numero(mortero, 3)} m³` },
    ],
  };
}

export const bloques: Calculadora = {
  slug: "bloques",
  imagen: "/proyectos/bloques.webp",
  titulo: "Bloques para paredes",
  descripcion: "Bloques de arcilla o de concreto y el mortero para pegarlos.",
  icono: IconoBloques,
  diagrama: "pared",
  comoMedir: "Mide el largo y el alto de la pared. Resta el área de puertas y ventanas.",
  campos: CAMPOS_PARED,
  grupos: [
    {
      id: "tipo",
      etiqueta: "Tipo de bloque",
      defecto: "arcilla",
      opciones: [
        { valor: "arcilla", etiqueta: "Arcilla", detalle: "Rojo, de 20 × 30 cm. El más usado en viviendas." },
        { valor: "concreto", etiqueta: "Concreto (Aliven)", detalle: "Gris, de 20 × 40 cm. Más resistente." },
      ],
    },
    {
      // Los espesores que vende la tienda: arcilla de 10, 12 y 15 cm; Aliven de 10, 12, 15 y 20 cm.
      id: "espesor",
      etiqueta: "Espesor del bloque",
      defecto: "15",
      opciones: [
        { valor: "10", etiqueta: "10 cm", detalle: "Divisiones internas." },
        { valor: "12", etiqueta: "12 cm", detalle: "Paredes internas más firmes." },
        { valor: "15", etiqueta: "15 cm", detalle: "Paredes de fachada." },
        { valor: "20", etiqueta: "20 cm", detalle: "Muros y cercas.", soloCon: { tipo: ["concreto"] } },
      ],
    },
  ],
  herramientas: ["cuchara", "nivel", "balde", "carretilla", "cinta-metrica", "guantes"],
  materiales: [
    "bloque-arcilla-10",
    "bloque-arcilla-12",
    "bloque-arcilla-15",
    "bloque-concreto-10",
    "bloque-concreto-12",
    "bloque-concreto-15",
    "bloque-concreto-20",
    "cemento",
    "arena",
  ],
  calcular: calcularBloques,
  explicacion: [
    "Calculamos el área de la pared (largo × alto) y le restamos las puertas y ventanas.",
    "Contamos cuántos bloques caben en un metro cuadrado dejando 1,5 cm de junta entre ellos: unos 15 de arcilla o 12 de concreto.",
    "Sumamos 5 % por los bloques que se parten o se cortan.",
    "Para pegarlos calculamos el mortero que llena las juntas (mezcla de 1 parte de cemento por 4 de arena), con 10 % de desperdicio.",
  ],
};

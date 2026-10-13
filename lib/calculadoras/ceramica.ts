import { LayoutGrid } from "lucide-react";
import { CAMPOS_SUPERFICIE } from "./campos";
import { DESPERDICIO, PRESENTACION, REVESTIMIENTOS } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/** Carato por m² (kg): (A + B) ÷ (A × B) × espesor de la pieza × ancho de la junta × densidad, con medidas en mm. */
export function caratoKgPorM2(ladoMm: number, espesorMm: number, juntaMm: number): number {
  return ((ladoMm + ladoMm) / (ladoMm * ladoMm)) * espesorMm * juntaMm * REVESTIMIENTOS.densidadCarato;
}

/**
 * Cerámica y porcelanato.
 *   cajas  = área × (1 + desperdicio) ÷ m² por caja      (10 % en colocación recta, 15 % en diagonal)
 *   pego   = área × kg de pego por m² × (1 + desperdicio) ÷ kg por saco
 *   carato = área × carato por m² (fórmula de la junta) × (1 + desperdicio) ÷ kg por bolsa
 */
export function calcularCeramica(entrada: Entrada): Resultado {
  const tipo = entrada.opciones.tipo === "porcelanato" ? "porcelanato" : "ceramica";
  const diagonal = entrada.opciones.colocacion === "diagonal";
  const pieza = REVESTIMIENTOS[tipo];
  const desperdicio = diagonal ? DESPERDICIO.ceramicaDiagonal : DESPERDICIO.ceramicaRecta;
  const area = medida(entrada, "largo") * medida(entrada, "ancho");

  const cajas = (area * (1 + desperdicio)) / pieza.m2PorCaja;
  const pegoKg = area * pieza.pegoKgPorM2 * (1 + DESPERDICIO.pego);
  const caratoPorM2 = caratoKgPorM2(pieza.ladoMm, pieza.espesorMm, pieza.juntaMm);
  const caratoKg = area * caratoPorM2 * (1 + DESPERDICIO.carato);

  return {
    materiales: [
      {
        material: tipo,
        cantidad: haciaArriba(cajas),
        nota: `${numero(area)} m² + ${desperdicio * 100} % ÷ ${numero(pieza.m2PorCaja)} m² por caja = ${numero(cajas)} cajas`,
      },
      {
        material: "pego",
        cantidad: haciaArriba(pegoKg / PRESENTACION.sacoPegoKg),
        nota: `${numero(area)} m² × ${pieza.pegoKgPorM2} kg/m² + ${DESPERDICIO.pego * 100} % = ${numero(pegoKg, 1)} kg`,
      },
      {
        material: "carato",
        cantidad: haciaArriba(caratoKg / PRESENTACION.bolsaCaratoKg),
        nota: `${numero(area)} m² × ${numero(caratoPorM2, 3)} kg/m² + ${DESPERDICIO.carato * 100} % = ${numero(caratoKg)} kg`,
      },
    ],
    datos: [
      { etiqueta: "Área a cubrir", valor: `${numero(area)} m²` },
      { etiqueta: "Con desperdicio", valor: `${numero(area * (1 + desperdicio))} m²` },
    ],
  };
}

export const ceramica: Calculadora = {
  slug: "ceramica",
  titulo: "Cerámica y porcelanato",
  descripcion: "Cajas de cerámica o porcelanato, pego y carato para tu piso.",
  icono: LayoutGrid,
  diagrama: "superficie",
  comoMedir: "Mide el largo y el ancho del piso. Si el espacio no es rectangular, divídelo en partes y suma.",
  campos: CAMPOS_SUPERFICIE,
  grupos: [
    {
      id: "tipo",
      etiqueta: "Tipo de revestimiento",
      defecto: "ceramica",
      opciones: [
        { valor: "ceramica", etiqueta: "Cerámica 45 × 45", detalle: "Caja de 2,03 m²." },
        { valor: "porcelanato", etiqueta: "Porcelanato 60 × 60", detalle: "Caja de 1,44 m²." },
      ],
    },
    {
      id: "colocacion",
      etiqueta: "Forma de colocación",
      defecto: "recta",
      opciones: [
        { valor: "recta", etiqueta: "Recta", detalle: "10 % de desperdicio por cortes." },
        { valor: "diagonal", etiqueta: "Diagonal", detalle: "15 %: lleva más cortes." },
      ],
    },
  ],
  herramientas: ["llana", "nivel", "balde", "cinta-metrica", "espatula", "guantes"],
  materiales: ["ceramica", "porcelanato", "pego", "carato"],
  calcular: calcularCeramica,
  explicacion: [
    "Calculamos el área del piso (largo × ancho).",
    "Sumamos el desperdicio por cortes: 10 % si las piezas van rectas y 15 % si van en diagonal.",
    "Dividimos entre los metros cuadrados que trae cada caja y redondeamos a cajas completas.",
    "El pego se calcula a 5 kg por m² en cerámica y 6 kg en porcelanato.",
    "El carato depende del tamaño de la pieza y del ancho de la junta: mientras más grande la pieza, menos carato lleva.",
  ],
};

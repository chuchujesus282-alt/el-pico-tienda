import { Grid3x3 } from "lucide-react";
import { CAMPOS_SUPERFICIE } from "./campos";
import { ALAMBRE_KG_POR_KG_ACERO, CABILLAS, PRESENTACION, SOLAPE_EN_DIAMETROS, type DiametroCabilla } from "./constantes";
import type { IdMaterial } from "./materiales";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/**
 * Barras comerciales que hacen falta para `tramos` tramos rectos de `largoTramo` metros.
 * - Si el tramo cabe en una barra, de cada barra salen ⌊barra ÷ tramo⌋ piezas.
 * - Si es más largo que la barra, se empalma con solape: lleva barras enteras más un pedazo final,
 *   y de cada barra salen ⌊barra ÷ pedazo⌋ pedazos.
 * Devuelve las barras y los metros de acero que quedan colocados (con solapes).
 */
export function barrasParaTramos(tramos: number, largoTramo: number, solapeM: number): { barras: number; metros: number } {
  const barra = PRESENTACION.barraCabillaM;
  if (tramos <= 0 || largoTramo <= 0) return { barras: 0, metros: 0 };
  if (largoTramo <= barra + 1e-9) {
    return { barras: Math.ceil(tramos / Math.floor(barra / largoTramo + 1e-9)), metros: tramos * largoTramo };
  }
  const piezas = Math.ceil((largoTramo - solapeM) / (barra - solapeM) - 1e-9);
  const largoConSolapes = largoTramo + (piezas - 1) * solapeM;
  const pedazo = largoConSolapes - (piezas - 1) * barra;
  const pedazosPorBarra = Math.max(1, Math.floor(barra / pedazo + 1e-9));
  return { barras: tramos * (piezas - 1) + Math.ceil(tramos / pedazosPorBarra), metros: tramos * largoConSolapes };
}

/**
 * Malla de cabillas para una losa o placa (acero en las dos direcciones).
 *   cabillas a lo largo = ⌈ancho ÷ separación⌉ + 1, cada una del largo de la losa
 *   cabillas a lo ancho = ⌈largo ÷ separación⌉ + 1, cada una del ancho de la losa
 *   barras = las que salen de cortar esos tramos de barras de 6 m (ver barrasParaTramos)
 *   alambre (kg) = peso del acero × 0,025
 * Con malla doble se duplica todo.
 */
export function calcularCabillas(entrada: Entrada): Resultado {
  const diametro = (entrada.opciones.diametro in CABILLAS ? entrada.opciones.diametro : "3/8") as DiametroCabilla;
  const capas = entrada.opciones.capas === "2" ? 2 : 1;
  const largo = medida(entrada, "largo");
  const ancho = medida(entrada, "ancho");
  const separacion = medida(entrada, "separacion") / 100;
  const { diametroMm, kgPorM } = CABILLAS[diametro];
  const solape = (SOLAPE_EN_DIAMETROS * diametroMm) / 1000;

  const aLoLargo = separacion > 0 ? Math.ceil(ancho / separacion - 1e-9) + 1 : 0;
  const aLoAncho = separacion > 0 ? Math.ceil(largo / separacion - 1e-9) + 1 : 0;
  const a = barrasParaTramos(aLoLargo * capas, largo, solape);
  const b = barrasParaTramos(aLoAncho * capas, ancho, solape);
  const barras = a.barras + b.barras;
  const pesoKg = (a.metros + b.metros) * kgPorM;
  const alambreKg = pesoKg * ALAMBRE_KG_POR_KG_ACERO;

  return {
    materiales: [
      {
        material: `cabilla-${diametro}` as IdMaterial,
        cantidad: barras,
        nota: `${aLoLargo * capas} tramos de ${numero(largo)} m + ${aLoAncho * capas} de ${numero(ancho)} m, cortados de barras de ${PRESENTACION.barraCabillaM} m`,
      },
      {
        material: "alambre",
        cantidad: haciaArriba(alambreKg / PRESENTACION.rolloAlambreKg),
        nota: `${numero(pesoKg, 1)} kg de acero × ${ALAMBRE_KG_POR_KG_ACERO * 1000} g por kg = ${numero(alambreKg)} kg`,
      },
    ],
    datos: [
      { etiqueta: "Cabillas a lo largo", valor: `${aLoLargo * capas} de ${numero(largo)} m` },
      { etiqueta: "Cabillas a lo ancho", valor: `${aLoAncho * capas} de ${numero(ancho)} m` },
      { etiqueta: "Acero colocado", valor: `${numero(a.metros + b.metros, 1)} m (${numero(pesoKg, 1)} kg)` },
    ],
  };
}

export const cabillas: Calculadora = {
  slug: "cabillas",
  titulo: "Cabillas para losas",
  descripcion: "Barras de acero y alambre de amarre para la malla de una losa o placa.",
  icono: Grid3x3,
  diagrama: "malla",
  comoMedir: "Mide el largo y el ancho de la losa. La separación es la distancia entre una cabilla y la siguiente.",
  campos: [
    ...CAMPOS_SUPERFICIE,
    { id: "separacion", etiqueta: "Separación entre cabillas", unidad: "cm", defecto: 20, maximo: 100, ayuda: "Lo indica el plano o el ingeniero. Lo usual es entre 15 y 25 cm." },
  ],
  grupos: [
    {
      id: "diametro",
      etiqueta: "Diámetro de la cabilla",
      defecto: "3/8",
      opciones: [
        { valor: "3/8", etiqueta: '3/8"', detalle: "Losas de vivienda." },
        { valor: "1/2", etiqueta: '1/2"', detalle: "Losas y placas con más carga." },
        { valor: "5/8", etiqueta: '5/8"', detalle: "Fundaciones y placas gruesas." },
      ],
    },
    {
      id: "capas",
      etiqueta: "Mallas",
      defecto: "1",
      opciones: [
        { valor: "1", etiqueta: "Una malla", detalle: "Lo usual en losas de piso." },
        { valor: "2", etiqueta: "Malla doble", detalle: "Arriba y abajo." },
      ],
    },
  ],
  herramientas: ["segueta", "cinta-metrica", "guantes", "lentes"],
  materiales: ["cabilla-3/8", "cabilla-1/2", "cabilla-5/8", "alambre"],
  calcular: calcularCabillas,
  explicacion: [
    "Armamos una malla con cabillas en las dos direcciones, separadas la distancia que indiques.",
    "Contamos cuántas cabillas van a lo largo y cuántas a lo ancho, y de qué medida es cada una.",
    "Las barras vienen de 6 m: calculamos cuántas hay que comprar para cortar todas las piezas. Si la losa mide más de 6 m, las cabillas se empalman montando una sobre otra 40 veces su diámetro.",
    "Para el alambre de amarre estimamos 25 gramos por cada kilo de acero.",
    "El diámetro y la separación los define el ingeniero o el plano de la obra.",
  ],
};

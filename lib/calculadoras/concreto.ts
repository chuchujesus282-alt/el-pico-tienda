import { Cuboid } from "lucide-react";
import { CONCRETO, DESPERDICIO, type ResistenciaConcreto } from "./constantes";
import type { Calculadora, Entrada, LineaMaterial, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/** Cemento, arena y piedra para un volumen de concreto (ya con desperdicio) de la resistencia dada. */
export function materialesConcreto(volumenM3: number, resistencia: ResistenciaConcreto): LineaMaterial[] {
  const d = CONCRETO[resistencia];
  const sacos = volumenM3 * d.sacos;
  const arena = volumenM3 * d.arenaM3;
  const piedra = volumenM3 * d.piedraM3;
  return [
    { material: "cemento", cantidad: haciaArriba(sacos), nota: `${numero(volumenM3)} m³ × ${numero(d.sacos)} sacos/m³ = ${numero(sacos)} sacos` },
    { material: "arena", cantidad: haciaArriba(arena), nota: `${numero(volumenM3)} m³ × ${numero(d.arenaM3)} = ${numero(arena)} m³` },
    { material: "piedra", cantidad: haciaArriba(piedra), nota: `${numero(volumenM3)} m³ × ${numero(d.piedraM3)} = ${numero(piedra)} m³` },
  ];
}

/**
 * Concreto para vaciados (losas, columnas, vigas, zapatas).
 *   volumen (m³) = largo × ancho × (espesor en cm ÷ 100) × cantidad de elementos × (1 + desperdicio)
 *   cada material = volumen × su dosificación por m³ según la resistencia (constantes.ts)
 */
export function calcularConcreto(entrada: Entrada): Resultado {
  const resistencia = (entrada.opciones.resistencia in CONCRETO ? entrada.opciones.resistencia : "210") as ResistenciaConcreto;
  const cantidad = medida(entrada, "cantidad") || 1;
  const neto = medida(entrada, "largo") * medida(entrada, "ancho") * (medida(entrada, "espesor") / 100) * cantidad;
  const volumen = neto * (1 + DESPERDICIO.concreto);
  return {
    materiales: materialesConcreto(volumen, resistencia),
    datos: [
      { etiqueta: "Volumen a vaciar", valor: `${numero(neto)} m³` },
      { etiqueta: `Con ${DESPERDICIO.concreto * 100} % de desperdicio`, valor: `${numero(volumen)} m³` },
      { etiqueta: "Agua aproximada", valor: `${numero(volumen * CONCRETO[resistencia].aguaL, 0)} litros` },
    ],
  };
}

const segunElemento = (losa: string, columna: string, viga: string, zapata: string) => ({
  grupo: "elemento",
  etiquetas: { losa, columna, viga, zapata },
});

export const concreto: Calculadora = {
  slug: "concreto",
  titulo: "Concreto para vaciados",
  descripcion: "Cemento, arena y piedra para losas, columnas, vigas y zapatas.",
  icono: Cuboid,
  diagrama: "volumen",
  comoMedir: "Mide largo, ancho y espesor del elemento. Si son varios iguales, indica cuántos.",
  campos: [
    { id: "largo", etiqueta: "Largo", unidad: "m", defecto: null, maximo: 500, etiquetaSegun: segunElemento("Largo de la losa", "Altura de la columna", "Largo de la viga", "Largo de la zapata") },
    { id: "ancho", etiqueta: "Ancho", unidad: "m", defecto: null, maximo: 500, etiquetaSegun: segunElemento("Ancho de la losa", "Ancho de la columna", "Ancho de la viga", "Ancho de la zapata") },
    { id: "espesor", etiqueta: "Espesor", unidad: "cm", defecto: 10, maximo: 500, etiquetaSegun: segunElemento("Espesor de la losa", "Fondo de la columna", "Alto de la viga", "Alto de la zapata") },
    { id: "cantidad", etiqueta: "Cantidad de elementos iguales", unidad: "un", defecto: 1, maximo: 500, entero: true },
  ],
  grupos: [
    {
      id: "elemento",
      etiqueta: "¿Qué vas a vaciar?",
      defecto: "losa",
      opciones: [
        { valor: "losa", etiqueta: "Losa o placa" },
        { valor: "columna", etiqueta: "Columna" },
        { valor: "viga", etiqueta: "Viga" },
        { valor: "zapata", etiqueta: "Zapata" },
      ],
    },
    {
      id: "resistencia",
      etiqueta: "Resistencia del concreto",
      defecto: "210",
      opciones: [
        { valor: "140", etiqueta: "140 kg/cm²", detalle: "Aceras y contrapisos." },
        { valor: "175", etiqueta: "175 kg/cm²", detalle: "Pisos y obras menores." },
        { valor: "210", etiqueta: "210 kg/cm²", detalle: "Losas, vigas y columnas de vivienda." },
        { valor: "245", etiqueta: "245 kg/cm²", detalle: "Estructuras con más carga." },
        { valor: "280", etiqueta: "280 kg/cm²", detalle: "Alta resistencia." },
      ],
    },
  ],
  herramientas: ["pala", "carretilla", "balde", "llana", "nivel", "guantes"],
  materiales: ["cemento", "arena", "piedra"],
  calcular: calcularConcreto,
  explicacion: [
    "Calculamos el volumen: largo × ancho × espesor, por la cantidad de elementos iguales.",
    "Sumamos 5 % por lo que se pierde al mezclar y vaciar.",
    "Según la resistencia que elijas, cada metro cúbico lleva una cantidad fija de cemento, arena y piedra. Por ejemplo, para 210 kg/cm²: 9,73 sacos de cemento, 0,52 m³ de arena y 0,53 m³ de piedra.",
    "El agua es aproximada: agrégala poco a poco hasta que la mezcla quede manejable.",
  ],
};

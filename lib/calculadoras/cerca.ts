import IconoCerca from "@/components/icons/pico/IconoCerca";
import { CERCA } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/** Rollos de alambre de púas que vende la tienda. */
const ROLLOS = {
  "300": { material: "alambre-pua-300", metros: 300 },
  "400": { material: "alambre-pua-400", metros: 400 },
} as const;

/**
 * Cerca de alambre de púas (persona B, 2026-11-11), con los rollos de la tienda (300 m cal. 14 y 400 m cal. 16).
 *   metros de alambre = perímetro × hilos × (1 + desperdicio para amarrar y tensar)
 *   rollos            = metros ÷ largo del rollo
 *   postes (dato)     = perímetro ÷ 2,5 m + 1
 */
export function calcularCerca(entrada: Entrada): Resultado {
  const rollo = ROLLOS[entrada.opciones.rollo as keyof typeof ROLLOS] ?? ROLLOS["300"];
  const hilos = Math.min(7, Math.max(1, Number(entrada.opciones.hilos) || 4));
  const perimetro = medida(entrada, "perimetro");
  const metros = perimetro * hilos * (1 + CERCA.desperdicio);
  const rollos = haciaArriba(metros / rollo.metros);
  const postes = perimetro > 0 ? haciaArriba(perimetro / CERCA.separacionPostesM) + 1 : 0;

  return {
    materiales:
      rollos > 0
        ? [
            {
              material: rollo.material,
              cantidad: rollos,
              nota: `${numero(perimetro)} m × ${hilos} hilos + ${CERCA.desperdicio * 100} % = ${numero(metros)} m ÷ ${rollo.metros} m = ${numero(rollos)} rollos`,
            },
          ]
        : [],
    datos: [
      { etiqueta: "Alambre necesario", valor: `${numero(metros)} m` },
      { etiqueta: "Postes aproximados", valor: `${postes} (uno cada ${numero(CERCA.separacionPostesM)} m)` },
    ],
  };
}

export const cerca: Calculadora = {
  slug: "cerca",
  imagen: null, // foto pendiente (persona B): el espacio queda con el plano del ícono
  titulo: "Cerca de alambre de púas",
  descripcion: "Rollos de alambre de púas para cercar un terreno o un potrero, según el perímetro y los hilos.",
  icono: IconoCerca,
  diagrama: "cerca",
  comoMedir: "Camina todo el borde del terreno que vas a cercar y suma sus lados: eso es el perímetro. Resta lo que ocupe un portón.",
  campos: [
    {
      id: "perimetro",
      etiqueta: "Perímetro a cercar",
      unidad: "m",
      defecto: null,
      maximo: 20000,
      ayuda: "Un terreno de 20 × 30 m tiene 100 m de perímetro.",
    },
  ],
  grupos: [
    {
      id: "hilos",
      etiqueta: "Hilos de alambre",
      defecto: "4",
      opciones: [
        { valor: "3", etiqueta: "3 hilos", detalle: "Lindero sencillo." },
        { valor: "4", etiqueta: "4 hilos", detalle: "Lo más común." },
        { valor: "5", etiqueta: "5 hilos", detalle: "Para ganado o más seguridad." },
      ],
    },
    {
      id: "rollo",
      etiqueta: "Rollo",
      defecto: "300",
      opciones: [
        { valor: "300", etiqueta: "300 m, calibre 14", detalle: "Más grueso y resistente." },
        { valor: "400", etiqueta: "400 m, calibre 16", detalle: "Más metros por rollo." },
      ],
    },
  ],
  herramientas: ["alicate", "guantes", "cinta-metrica"],
  materiales: ["alambre-pua-300", "alambre-pua-400"],
  calcular: calcularCerca,
  explicacion: [
    "Multiplicamos el perímetro por la cantidad de hilos: son los metros de alambre que se tienden.",
    "Sumamos 5 % para los amarres en cada poste y lo que se pierde al tensar.",
    "Dividimos entre el largo del rollo (300 o 400 m) y redondeamos hacia arriba.",
    "Te decimos también cuántos postes van, uno cada 2,5 m más el del final, para que los tengas listos.",
  ],
};

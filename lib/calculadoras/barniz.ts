import IconoBrocha from "@/components/icons/pico/IconoBrocha";
import { DESPERDICIO, MADERA } from "./constantes";
import type { Calculadora, Entrada, LineaMaterial, Resultado } from "./tipos";
import { lineasGalonCuarto, medida, numero } from "./util";

/**
 * Barnizar madera (persona B, 2026-11-11), con el sellador y los barnices Menequim de la tienda.
 *   superficie = largo × ancho × caras
 *   sellador   = superficie ÷ 30 m²/galón × (1 + desperdicio), una mano, solo en madera nueva o lijada
 *   barniz     = superficie × manos ÷ 35 m²/galón × (1 + desperdicio): natural adentro, marino afuera (sol y lluvia)
 * Todo sale en galones y cuartos (galonesYCuartos).
 */
export function calcularBarniz(entrada: Entrada): Resultado {
  const caras = entrada.opciones.caras === "2" ? 2 : 1;
  const manos = Math.min(3, Math.max(1, Number(entrada.opciones.manos) || 2));
  const marino = entrada.opciones.lugar === "afuera";
  const superficie = medida(entrada, "largo") * medida(entrada, "ancho") * caras;
  const extra = 1 + DESPERDICIO.pintura;

  const materiales: LineaMaterial[] = [];
  if (entrada.opciones.madera !== "barnizada") {
    const sellador = (superficie / MADERA.selladorM2PorGalon) * extra;
    materiales.push(
      ...lineasGalonCuarto(
        sellador,
        "sellador-madera-galon",
        "sellador-madera-cuarto",
        `${numero(superficie)} m² ÷ ${MADERA.selladorM2PorGalon} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(sellador)} galones`,
      ),
    );
  }
  const barniz = ((superficie * manos) / MADERA.barnizM2PorGalon) * extra;
  materiales.push(
    ...lineasGalonCuarto(
      barniz,
      marino ? "barniz-marino-galon" : "barniz-natural-galon",
      marino ? "barniz-marino-cuarto" : "barniz-natural-cuarto",
      `${numero(superficie)} m² × ${manos} ${manos === 1 ? "mano" : "manos"} ÷ ${MADERA.barnizM2PorGalon} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(barniz)} galones`,
    ),
  );

  return {
    materiales,
    datos: [
      { etiqueta: "Madera a barnizar", valor: `${numero(superficie)} m²${caras === 2 ? " (las dos caras)" : ""}` },
      { etiqueta: "Barniz", valor: marino ? "Marino (aguanta sol y lluvia)" : "Natural brillante" },
    ],
  };
}

export const barniz: Calculadora = {
  slug: "barniz",
  imagen: null, // foto pendiente (persona B): el espacio queda con el plano del ícono
  titulo: "Barnizar madera",
  descripcion: "Sellador y barniz natural o marino para puertas, muebles y techos de madera.",
  icono: IconoBrocha,
  diagrama: "superficie",
  comoMedir: "Mide el largo y el ancho de la pieza (puerta, mesa, closet, machihembrado). Si son varias, suma sus largos.",
  campos: [
    { id: "largo", etiqueta: "Largo", unidad: "m", defecto: null, maximo: 500 },
    { id: "ancho", etiqueta: "Ancho", unidad: "m", defecto: null, maximo: 100 },
  ],
  grupos: [
    {
      id: "lugar",
      etiqueta: "¿Dónde está la madera?",
      defecto: "adentro",
      opciones: [
        { valor: "adentro", etiqueta: "Adentro", detalle: "Muebles, puertas internas, closets: barniz natural." },
        { valor: "afuera", etiqueta: "Afuera", detalle: "Le da el sol o la lluvia: barniz marino." },
      ],
    },
    {
      id: "madera",
      etiqueta: "¿Cómo está la madera?",
      defecto: "nueva",
      opciones: [
        { valor: "nueva", etiqueta: "Nueva o lijada", detalle: "Lleva una mano de sellador antes del barniz." },
        { valor: "barnizada", etiqueta: "Ya barnizada", detalle: "Solo una lijada suave y barniz." },
      ],
    },
    {
      id: "caras",
      etiqueta: "Caras",
      defecto: "1",
      opciones: [
        { valor: "1", etiqueta: "Una cara", detalle: "Mesa, piso, techo machihembrado." },
        { valor: "2", etiqueta: "Las dos caras", detalle: "Puertas y tablas sueltas." },
      ],
    },
    {
      id: "manos",
      etiqueta: "Manos de barniz",
      defecto: "2",
      opciones: [
        { valor: "1", etiqueta: "1 mano", detalle: "Mantenimiento." },
        { valor: "2", etiqueta: "2 manos", detalle: "Lo recomendado." },
        { valor: "3", etiqueta: "3 manos", detalle: "Afuera o mucho uso." },
      ],
    },
  ],
  herramientas: ["lija", "brocha", "cinta-enmascarar", "guantes"],
  materiales: [
    "sellador-madera-galon",
    "sellador-madera-cuarto",
    "barniz-natural-galon",
    "barniz-natural-cuarto",
    "barniz-marino-galon",
    "barniz-marino-cuarto",
  ],
  calcular: calcularBarniz,
  explicacion: [
    "Calculamos la madera a barnizar (largo × ancho), por una o por las dos caras.",
    "Si la madera es nueva o la lijaste hasta el fondo, primero va una mano de sellador, que rinde unos 30 m² por galón. Cierra el poro para que el barniz no se chupe.",
    "El barniz rinde unos 35 m² por galón en cada mano. Adentro va el natural; afuera, el marino, que aguanta el sol y la lluvia.",
    "Sumamos 5 % de desperdicio y te lo damos en galones y cuartos (1/4 de galón): si te faltan 3 cuartos o más, sale mejor un galón entero.",
    "Entre mano y mano, una lijada suave con lija fina deja el acabado liso.",
  ],
};

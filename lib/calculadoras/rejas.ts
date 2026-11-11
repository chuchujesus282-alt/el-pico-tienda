import IconoReja from "@/components/icons/pico/IconoReja";
import { DESPERDICIO, METAL } from "./constantes";
import type { Calculadora, Entrada, LineaMaterial, Resultado } from "./tipos";
import { haciaArriba, lineasGalonCuarto, medida, numero } from "./util";

/** Superficie de metal a pintar por cada m² del marco, según el tipo de pieza. */
const CARAS: Record<string, { factor: number; texto: string }> = {
  reja: { factor: METAL.factorReja * 2, texto: "Metal a pintar (todos sus lados)" },
  "lamina-1": { factor: 1, texto: "Metal a pintar (una cara)" },
  "lamina-2": { factor: 2, texto: "Metal a pintar (las dos caras)" },
};

/**
 * Pintar rejas, portones y piezas de metal (persona B, 2026-11-11), con los productos Manpica y Menequim de la tienda.
 *   superficie = alto × ancho × piezas × factor (reja de barrotes: 60 % por cada lado; lámina: 1 o 2 caras)
 *   fondo      = superficie ÷ 35 m²/galón × (1 + desperdicio), una mano, solo en metal nuevo u oxidado
 *   esmalte    = superficie × manos ÷ 40 m²/galón × (1 + desperdicio)
 *   thinner    = 1 galón por cada 4 de pintura (para rebajar y limpiar)
 * Fondo y esmalte salen en galones y cuartos (galonesYCuartos).
 */
export function calcularRejas(entrada: Entrada): Resultado {
  const caras = CARAS[entrada.opciones.tipo] ?? CARAS.reja;
  const manos = entrada.opciones.manos === "1" ? 1 : 2;
  const conFondo = entrada.opciones.estado !== "pintado";
  const piezas = Math.max(1, Math.round(medida(entrada, "piezas")) || 1);
  const marco = medida(entrada, "alto") * medida(entrada, "ancho") * piezas;
  const superficie = marco * caras.factor;
  const extra = 1 + DESPERDICIO.pintura;

  const materiales: LineaMaterial[] = [];
  let galonesPintura = 0;
  if (conFondo) {
    const fondo = (superficie / METAL.fondoM2PorGalon) * extra;
    galonesPintura += fondo;
    materiales.push(
      ...lineasGalonCuarto(
        fondo,
        "fondo-herreria-galon",
        "fondo-herreria-cuarto",
        `${numero(superficie)} m² ÷ ${METAL.fondoM2PorGalon} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(fondo)} galones`,
      ),
    );
  }
  const esmalte = ((superficie * manos) / METAL.esmalteM2PorGalon) * extra;
  galonesPintura += esmalte;
  materiales.push(
    ...lineasGalonCuarto(
      esmalte,
      "esmalte-galon",
      "esmalte-cuarto",
      `${numero(superficie)} m² × ${manos} ${manos === 1 ? "mano" : "manos"} ÷ ${METAL.esmalteM2PorGalon} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(esmalte)} galones`,
    ),
  );
  if (superficie > 0) {
    const thinner = galonesPintura / METAL.galonesPinturaPorThinner;
    materiales.push({
      material: "thinner",
      cantidad: Math.max(1, haciaArriba(thinner)),
      nota: `${numero(galonesPintura)} galones de pintura ÷ ${METAL.galonesPinturaPorThinner} = ${numero(thinner)} galones (mínimo 1)`,
    });
  }

  return {
    materiales,
    datos: [
      { etiqueta: "Tamaño del marco", valor: `${numero(marco)} m²` },
      { etiqueta: caras.texto, valor: `${numero(superficie)} m²` },
    ],
  };
}

export const rejas: Calculadora = {
  slug: "rejas",
  imagen: null, // foto pendiente (persona B): el espacio queda con el plano del ícono
  titulo: "Pintar rejas y metal",
  descripcion: "Fondo de herrería, esmalte y thinner para rejas, portones y puertas de metal.",
  icono: IconoReja,
  diagrama: "reja",
  comoMedir: "Mide el ancho y el alto de todo el marco de la reja o del portón, como si fuera una lámina. Si son varias iguales, pon cuántas.",
  campos: [
    { id: "ancho", etiqueta: "Ancho", unidad: "m", defecto: null, maximo: 100 },
    { id: "alto", etiqueta: "Alto", unidad: "m", defecto: 2, maximo: 20 },
    { id: "piezas", etiqueta: "Piezas iguales", unidad: "un", defecto: 1, maximo: 200, entero: true, ayuda: "Ej.: 4 ventanas con la misma protección." },
  ],
  grupos: [
    {
      id: "tipo",
      etiqueta: "¿Qué vas a pintar?",
      defecto: "reja",
      opciones: [
        { valor: "reja", etiqueta: "Reja o protector", detalle: "Barrotes o tubos: se pintan por todos sus lados." },
        { valor: "lamina-2", etiqueta: "Portón o puerta de lámina", detalle: "Lámina lisa por las dos caras." },
        { valor: "lamina-1", etiqueta: "Lámina por una cara", detalle: "Ej.: el lado de afuera de un portón." },
      ],
    },
    {
      id: "estado",
      etiqueta: "¿Cómo está el metal?",
      defecto: "nuevo",
      opciones: [
        { valor: "nuevo", etiqueta: "Nuevo u oxidado", detalle: "Lleva una mano de fondo de herrería (anticorrosivo)." },
        { valor: "pintado", etiqueta: "Ya pintado y sano", detalle: "Solo esmalte, sin fondo." },
      ],
    },
    {
      id: "manos",
      etiqueta: "Manos de esmalte",
      defecto: "2",
      opciones: [
        { valor: "1", etiqueta: "1 mano", detalle: "Retoque del mismo color." },
        { valor: "2", etiqueta: "2 manos", detalle: "Lo recomendado." },
      ],
    },
  ],
  herramientas: ["cepillo-alambre", "lija", "brocha", "cinta-enmascarar", "guantes"],
  materiales: ["fondo-herreria-galon", "fondo-herreria-cuarto", "esmalte-galon", "esmalte-cuarto", "thinner"],
  calcular: calcularRejas,
  explicacion: [
    "Calculamos el tamaño del marco (ancho × alto × piezas).",
    "Una reja de barrotes tiene huecos, pero se pinta por todos lados: contamos un 60 % del marco por cada cara. Una lámina lisa cuenta entera, por una o por las dos caras.",
    "Si el metal es nuevo o tiene óxido, primero va una mano de fondo de herrería, que rinde unos 35 m² por galón. Antes, quita el óxido con cepillo de alambre y lija.",
    "El esmalte rinde unos 40 m² por galón en cada mano. Sumamos 5 % de desperdicio.",
    "Te lo damos en galones y en cuartos (1/4 de galón): si te faltan 3 cuartos o más, sale mejor un galón entero.",
    "El thinner sirve para rebajar el esmalte y limpiar las brochas: 1 galón por cada 4 de pintura.",
  ],
};

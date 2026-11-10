import IconoLamina from "@/components/icons/pico/IconoLamina";
import { DESPERDICIO, PRESENTACION, TECHO } from "./constantes";
import type { IdMaterial } from "./materiales";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/**
 * Largo de lámina que se compra (de los que vende la tienda) y cuántas van por hilera: la más corta que cubre la caída
 * de una sola pieza; si la caída es más larga que todas, la más larga, empalmada con solape.
 */
export function laminaParaCaida(largos: readonly number[], caida: number): { largoM: number; porHilera: number } {
  const entera = largos.find((l) => caida <= l + 1e-9);
  if (entera !== undefined) return { largoM: entera, porHilera: 1 };
  const mayor = largos[largos.length - 1];
  return { largoM: mayor, porHilera: Math.ceil((caida - TECHO.solapeLargoM) / (mayor - TECHO.solapeLargoM) - 1e-9) };
}

/**
 * Techo con láminas (zinc o Acerotec), con los largos que vende la tienda.
 *   hileras = ⌈largo del techo ÷ ancho útil de la lámina⌉
 *   lámina = la más corta que cubre la caída; si ninguna, la más larga y ⌈(caída − solape) ÷ (largo − solape)⌉ por hilera
 *   láminas = hileras × láminas por hilera × aguas × (1 + desperdicio)
 *   tornillos = área del techo × tornillos por m² × (1 + desperdicio)
 */
export function calcularTecho(entrada: Entrada): Resultado {
  const tipo = entrada.opciones.lamina === "acerotec" ? "acerotec" : "zinc";
  const aguas = entrada.opciones.aguas === "2" ? 2 : 1;
  const lamina = TECHO[tipo];
  const largo = medida(entrada, "largo");
  const caida = medida(entrada, "caida");

  const hileras = Math.ceil(largo / lamina.anchoUtilM - 1e-9);
  const { largoM, porHilera } = laminaParaCaida(lamina.largosM, caida);
  const netas = hileras * porHilera * aguas;
  const area = largo * caida * aguas;
  const tornillos = area * TECHO.tornillosPorM2 * (1 + DESPERDICIO.tornillosTecho);

  return {
    materiales: [
      {
        material: `lamina-${tipo}-${Math.round(largoM * 100)}` as IdMaterial,
        cantidad: haciaArriba(netas * (1 + DESPERDICIO.laminasTecho)),
        nota: `${hileras} hileras × ${porHilera} de ${numero(largoM)} m × ${aguas} ${aguas === 1 ? "agua" : "aguas"} = ${netas}, + ${DESPERDICIO.laminasTecho * 100} %`,
      },
      {
        material: "tornillo-techo",
        cantidad: haciaArriba(tornillos / PRESENTACION.tornillosTechoPorBolsa),
        nota: `${numero(area)} m² × ${TECHO.tornillosPorM2} por m² + ${DESPERDICIO.tornillosTecho * 100} % = ${numero(tornillos, 0)} tornillos`,
      },
    ],
    datos: [
      { etiqueta: "Área del techo", valor: `${numero(area)} m²` },
      { etiqueta: "Lámina", valor: `${numero(largoM)} m de largo` },
      { etiqueta: "Hileras de láminas", valor: `${hileras} por agua` },
      { etiqueta: "Láminas por hilera", valor: String(porHilera) },
    ],
  };
}

export const techo: Calculadora = {
  slug: "techo",
  imagen: null, // foto pendiente (persona B): el espacio queda con el plano del ícono
  titulo: "Techo con láminas",
  descripcion: "Láminas de zinc o Acerotec y los tornillos para fijarlas.",
  icono: IconoLamina,
  diagrama: "techo",
  comoMedir: "El largo va a lo largo del alero. La caída se mide siguiendo la pendiente, desde la parte alta hasta el borde.",
  campos: [
    { id: "largo", etiqueta: "Largo del techo", unidad: "m", defecto: null, maximo: 300 },
    { id: "caida", etiqueta: "Caída (por cada agua)", unidad: "m", defecto: null, maximo: 100, ayuda: "Incluye lo que sobresale del alero." },
  ],
  grupos: [
    {
      id: "lamina",
      etiqueta: "Tipo de lámina",
      defecto: "zinc",
      opciones: [
        { valor: "zinc", etiqueta: "Zinc ondulado", detalle: "De 2,44, 3,00 o 3,60 m. Económica." },
        { valor: "acerotec", etiqueta: "Acerotec", detalle: "De 3, 4 o 6 m. Más aislante y duradera." },
      ],
    },
    {
      id: "aguas",
      etiqueta: "Aguas del techo",
      defecto: "1",
      opciones: [
        { valor: "1", etiqueta: "Un agua", detalle: "Una sola pendiente." },
        { valor: "2", etiqueta: "Dos aguas", detalle: "Dos pendientes iguales." },
      ],
    },
  ],
  herramientas: ["taladro", "cinta-metrica", "escalera", "guantes", "lentes"],
  materiales: [
    "lamina-zinc-244",
    "lamina-zinc-300",
    "lamina-zinc-360",
    "lamina-acerotec-300",
    "lamina-acerotec-400",
    "lamina-acerotec-600",
    "tornillo-techo",
  ],
  calcular: calcularTecho,
  explicacion: [
    "Cada lámina cubre menos de lo que mide de ancho, porque se monta sobre la de al lado: unos 70 cm el zinc y 76 cm el Acerotec.",
    "Dividimos el largo del techo entre ese ancho útil para saber cuántas hileras hacen falta.",
    "Elegimos el largo de lámina que vendemos que cubre la caída de una sola pieza (zinc de 2,44, 3,00 o 3,60 m; Acerotec de 3, 4 o 6 m). Si la caída es más larga, cada hilera lleva más de una, montadas 20 cm entre sí.",
    "Multiplicamos por las aguas del techo y sumamos 5 % por cortes.",
    "Los tornillos se calculan a 6 por metro cuadrado de techo.",
  ],
};

import IconoLamina from "@/components/icons/pico/IconoLamina";
import { DESPERDICIO, PRESENTACION, TECHO } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/**
 * Techo con láminas (zinc o acerolit).
 *   hileras = ⌈largo del techo ÷ ancho útil de la lámina⌉
 *   láminas por hilera = 1 si la caída cabe en una lámina; si no, ⌈(caída − solape) ÷ (largo de lámina − solape)⌉
 *   láminas = hileras × láminas por hilera × aguas × (1 + desperdicio)
 *   tornillos = área del techo × tornillos por m² × (1 + desperdicio)
 */
export function calcularTecho(entrada: Entrada): Resultado {
  const tipo = entrada.opciones.lamina === "acerolit" ? "acerolit" : "zinc";
  const aguas = entrada.opciones.aguas === "2" ? 2 : 1;
  const lamina = TECHO[tipo];
  const largo = medida(entrada, "largo");
  const caida = medida(entrada, "caida");

  const hileras = Math.ceil(largo / lamina.anchoUtilM - 1e-9);
  const porHilera =
    caida <= lamina.largoM + 1e-9 ? 1 : Math.ceil((caida - TECHO.solapeLargoM) / (lamina.largoM - TECHO.solapeLargoM) - 1e-9);
  const netas = hileras * porHilera * aguas;
  const area = largo * caida * aguas;
  const tornillos = area * TECHO.tornillosPorM2 * (1 + DESPERDICIO.tornillosTecho);

  return {
    materiales: [
      {
        material: `lamina-${tipo}`,
        cantidad: haciaArriba(netas * (1 + DESPERDICIO.laminasTecho)),
        nota: `${hileras} hileras × ${porHilera} por hilera × ${aguas} ${aguas === 1 ? "agua" : "aguas"} = ${netas}, + ${DESPERDICIO.laminasTecho * 100} %`,
      },
      {
        material: "tornillo-techo",
        cantidad: haciaArriba(tornillos / PRESENTACION.tornillosTechoPorBolsa),
        nota: `${numero(area)} m² × ${TECHO.tornillosPorM2} por m² + ${DESPERDICIO.tornillosTecho * 100} % = ${numero(tornillos, 0)} tornillos`,
      },
    ],
    datos: [
      { etiqueta: "Área del techo", valor: `${numero(area)} m²` },
      { etiqueta: "Hileras de láminas", valor: `${hileras} por agua` },
      { etiqueta: "Láminas por hilera", valor: String(porHilera) },
    ],
  };
}

export const techo: Calculadora = {
  slug: "techo",
  imagen: "/proyectos/techo.webp",
  titulo: "Techo con láminas",
  descripcion: "Láminas de zinc o acerolit y los tornillos para fijarlas.",
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
        { valor: "zinc", etiqueta: "Zinc ondulado", detalle: "3,66 m de largo. Económica." },
        { valor: "acerolit", etiqueta: "Acerolit", detalle: "3,66 m de largo. Más aislante y duradera." },
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
  materiales: ["lamina-zinc", "lamina-acerolit", "tornillo-techo"],
  calcular: calcularTecho,
  explicacion: [
    "Cada lámina cubre menos de lo que mide de ancho, porque se monta sobre la de al lado: unos 70 cm el zinc y 76 cm el acerolit.",
    "Dividimos el largo del techo entre ese ancho útil para saber cuántas hileras hacen falta.",
    "Si la caída es más larga que la lámina (3,66 m), cada hilera lleva más de una, montadas 20 cm entre sí.",
    "Multiplicamos por las aguas del techo y sumamos 5 % por cortes.",
    "Los tornillos se calculan a 6 por metro cuadrado de techo.",
  ],
};

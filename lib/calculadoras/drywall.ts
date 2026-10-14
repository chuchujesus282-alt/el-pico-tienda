import { Columns3 } from "lucide-react";
import { CAMPOS_PARED } from "./campos";
import { DESPERDICIO, DRYWALL, PRESENTACION } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { areaPared, haciaArriba, medida, numero } from "./util";

/**
 * Pared o revestimiento de drywall.
 *   superficie = área de pared × caras (1 o 2)
 *   láminas    = superficie × (1 + desperdicio) ÷ m² por lámina (1,22 × 2,44)
 *   parales    = (⌈largo ÷ separación⌉ + 1) × ⌈alto ÷ largo del perfil⌉
 *   rieles     = 2 × largo (piso y techo) × (1 + desperdicio) ÷ largo del perfil
 *   tornillos  = láminas × tornillos por lámina
 *   cinta      = superficie × metros de junta por m²
 *   masilla    = superficie × kg por m²
 */
export function calcularDrywall(entrada: Entrada): Resultado {
  const caras = entrada.opciones.caras === "1" ? 1 : 2;
  const separacion = entrada.opciones.separacion === "40" ? 0.406 : 0.61;
  const largo = medida(entrada, "largo");
  const alto = medida(entrada, "alto");
  const superficie = areaPared(entrada) * caras;

  const laminasExactas = (superficie * (1 + DESPERDICIO.laminasDrywall)) / DRYWALL.laminaM2;
  const laminas = haciaArriba(laminasExactas);
  const lineas = Math.ceil(largo / separacion - 1e-9) + 1;
  const piezasPorLinea = Math.max(1, Math.ceil(alto / DRYWALL.largoPerfilM - 1e-9));
  const rieles = (2 * largo * (1 + DESPERDICIO.rielesDrywall)) / DRYWALL.largoPerfilM;
  const tornillos = laminas * DRYWALL.tornillosPorLamina;
  const cintaM = superficie * DRYWALL.cintaMPorM2;
  const masillaKg = superficie * DRYWALL.masillaKgPorM2;

  return {
    materiales: [
      {
        material: "lamina-drywall",
        cantidad: laminas,
        nota: `${numero(superficie)} m² + ${DESPERDICIO.laminasDrywall * 100} % ÷ ${numero(DRYWALL.laminaM2)} m² por lámina = ${numero(laminasExactas)}`,
      },
      {
        material: "paral",
        cantidad: lineas * piezasPorLinea,
        nota: `${numero(largo)} m ÷ ${numero(separacion * 100, 1)} cm + 1 = ${lineas} parales${piezasPorLinea > 1 ? ` × ${piezasPorLinea} por la altura` : ""}`,
      },
      {
        material: "riel",
        cantidad: haciaArriba(rieles),
        nota: `2 × ${numero(largo)} m + ${DESPERDICIO.rielesDrywall * 100} % ÷ ${numero(DRYWALL.largoPerfilM)} m = ${numero(rieles)}`,
      },
      {
        material: "tornillo-drywall",
        cantidad: haciaArriba(tornillos / PRESENTACION.tornillosDrywallPorCaja),
        nota: `${laminas} láminas × ${DRYWALL.tornillosPorLamina} = ${tornillos} tornillos`,
      },
      {
        material: "cinta-juntas",
        cantidad: haciaArriba(cintaM / PRESENTACION.rolloCintaJuntasM),
        nota: `${numero(superficie)} m² × ${numero(DRYWALL.cintaMPorM2)} m/m² = ${numero(cintaM, 1)} m`,
      },
      {
        material: "masilla",
        cantidad: haciaArriba(masillaKg / PRESENTACION.galonMasillaKg),
        nota: `${numero(superficie)} m² × ${numero(DRYWALL.masillaKgPorM2)} kg/m² = ${numero(masillaKg, 1)} kg`,
      },
    ],
    datos: [
      { etiqueta: "Superficie de láminas", valor: `${numero(superficie)} m²` },
      { etiqueta: "Parales", valor: `cada ${numero(separacion * 100, 1)} cm` },
    ],
  };
}

export const drywall: Calculadora = {
  slug: "drywall",
  imagen: "/proyectos/drywall.webp",
  titulo: "Drywall",
  descripcion: "Láminas, parales, rieles, tornillos, cinta y masilla para tu pared.",
  icono: Columns3,
  diagrama: "pared",
  comoMedir: "Mide el largo y el alto de la pared. Resta el área de puertas y ventanas.",
  campos: CAMPOS_PARED,
  grupos: [
    {
      id: "caras",
      etiqueta: "¿Qué vas a construir?",
      defecto: "2",
      opciones: [
        { valor: "2", etiqueta: "Pared divisoria", detalle: "Láminas por los dos lados." },
        { valor: "1", etiqueta: "Revestimiento", detalle: "Láminas por un solo lado, sobre una pared." },
      ],
    },
    {
      id: "separacion",
      etiqueta: "Separación de los parales",
      defecto: "61",
      opciones: [
        { valor: "61", etiqueta: "Cada 61 cm", detalle: "Lo usual." },
        { valor: "40", etiqueta: "Cada 40,6 cm", detalle: "Más firme: para colgar peso o enchapar." },
      ],
    },
  ],
  herramientas: ["taladro", "espatula", "nivel", "cinta-metrica", "lentes"],
  materiales: ["lamina-drywall", "paral", "riel", "tornillo-drywall", "cinta-juntas", "masilla"],
  calcular: calcularDrywall,
  explicacion: [
    "Calculamos el área de la pared y la multiplicamos por las caras que llevan lámina (una o dos).",
    "Cada lámina mide 1,22 × 2,44 m (casi 3 m²). Sumamos 10 % por cortes.",
    "Los parales van de pie, uno cada 61 cm (o cada 40,6 cm), más uno para cerrar. Los rieles van en el piso y en el techo, a todo lo largo.",
    "Calculamos 30 tornillos por lámina, 1,5 m de cinta y 0,7 kg de masilla por cada metro cuadrado de lámina.",
  ],
};

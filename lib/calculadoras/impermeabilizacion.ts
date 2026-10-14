import { Umbrella } from "lucide-react";
import { CAMPOS_SUPERFICIE } from "./campos";
import { DESPERDICIO, IMPERMEABILIZACION, PRESENTACION } from "./constantes";
import type { Calculadora, Entrada, Resultado } from "./tipos";
import { haciaArriba, medida, numero } from "./util";

/**
 * Impermeabilización de techos.
 *   área a cubrir = largo × ancho × (1 + desperdicio)     (el desperdicio cubre bordes y remates)
 *   Manto asfáltico: rollos = área ÷ m² útiles por rollo (10 m² menos el solape de 10 cm = 9 m²)
 *                    primer = área ÷ m² por galón
 *   Acrílico:        cuñetes = área × litros por m² ÷ litros por cuñete
 */
export function calcularImpermeabilizacion(entrada: Entrada): Resultado {
  const neta = medida(entrada, "largo") * medida(entrada, "ancho");
  const area = neta * (1 + DESPERDICIO.impermeabilizacion);
  const datos = [
    { etiqueta: "Área del techo", valor: `${numero(neta)} m²` },
    { etiqueta: "Con bordes y remates", valor: `${numero(area)} m²` },
  ];

  if (entrada.opciones.sistema === "acrilico") {
    const litros = area * IMPERMEABILIZACION.acrilicoLitrosPorM2;
    return {
      materiales: [
        {
          material: "impermeabilizante-acrilico",
          cantidad: haciaArriba(litros / PRESENTACION.cuneteImpermeabilizanteL),
          nota: `${numero(area)} m² × ${IMPERMEABILIZACION.acrilicoLitrosPorM2} L/m² = ${numero(litros, 1)} litros`,
        },
      ],
      datos,
    };
  }

  const utilPorRollo = PRESENTACION.rolloMantoM2 * (1 - IMPERMEABILIZACION.solapeMantoM);
  return {
    materiales: [
      {
        material: "manto",
        cantidad: haciaArriba(area / utilPorRollo),
        nota: `${numero(area)} m² ÷ ${numero(utilPorRollo)} m² útiles por rollo = ${numero(area / utilPorRollo)} rollos`,
      },
      {
        material: "primer-asfaltico",
        cantidad: haciaArriba(area / IMPERMEABILIZACION.primerM2PorGalon),
        nota: `${numero(area)} m² ÷ ${IMPERMEABILIZACION.primerM2PorGalon} m² por galón = ${numero(area / IMPERMEABILIZACION.primerM2PorGalon)} galones`,
      },
    ],
    datos,
  };
}

export const impermeabilizacion: Calculadora = {
  slug: "impermeabilizacion",
  imagen: "/proyectos/impermeabilizacion.webp",
  titulo: "Impermeabilización de techos",
  descripcion: "Manto asfáltico con su primer, o impermeabilizante acrílico.",
  icono: Umbrella,
  diagrama: "superficie",
  comoMedir: "Mide el largo y el ancho de la platabanda o del techo. Nosotros sumamos los bordes.",
  campos: CAMPOS_SUPERFICIE,
  grupos: [
    {
      id: "sistema",
      etiqueta: "Sistema",
      defecto: "manto",
      opciones: [
        { valor: "manto", etiqueta: "Manto asfáltico", detalle: "Rollos de 3 mm con soplete. El más duradero." },
        { valor: "acrilico", etiqueta: "Acrílico", detalle: "Se aplica con rodillo o brocha, en dos manos." },
      ],
    },
  ],
  herramientas: ["brocha", "rodillo", "espatula", "guantes", "escalera"],
  materiales: ["manto", "primer-asfaltico", "impermeabilizante-acrilico"],
  calcular: calcularImpermeabilizacion,
  explicacion: [
    "Calculamos el área del techo (largo × ancho) y sumamos 10 % para subir el material por los bordes y hacer los remates.",
    "Manto asfáltico: cada rollo trae 10 m², pero se monta 10 cm sobre el anterior, así que cubre 9 m². Antes se aplica primer, que rinde unos 12 m² por galón.",
    "Acrílico: se aplica en dos manos y gasta cerca de 1 litro por metro cuadrado en total. Un cuñete trae 18,9 litros.",
  ],
};

import { PaintRoller } from "lucide-react";
import { CAMPOS_PARED } from "./campos";
import { DESPERDICIO, PINTURA, PRESENTACION } from "./constantes";
import type { Calculadora, Entrada, LineaMaterial, Resultado } from "./tipos";
import { areaPared, haciaArriba, numero } from "./util";

/** Reparte galones en cuñetes y galones sueltos; si sobran 3 o más galones, conviene otro cuñete. */
export function repartirEnCunetes(galones: number): { cunetes: number; sueltos: number } {
  const porCunete = PRESENTACION.galonesPorCunete;
  let cunetes = Math.floor(galones / porCunete);
  let sueltos = galones % porCunete;
  if (sueltos >= PRESENTACION.galonesSueltosQueConvieneCunete) {
    cunetes += 1;
    sueltos = 0;
  }
  return { cunetes, sueltos };
}

/**
 * Pintura de paredes.
 *   galones  = área × manos ÷ rendimiento (m² por galón y mano) × (1 + desperdicio)
 *   sellador = área ÷ rendimiento del sellador × (1 + desperdicio), solo en superficies nuevas (una mano)
 * Los galones se reparten en cuñetes de 4 galones y galones sueltos.
 */
export function calcularPintura(entrada: Entrada): Resultado {
  const manos = Math.min(3, Math.max(1, Number(entrada.opciones.manos) || 2));
  const rendimiento = entrada.opciones.superficie === "rugosa" ? PINTURA.rendimientoRugosaM2 : PINTURA.rendimientoLisaM2;
  const area = areaPared(entrada);

  const galonesExactos = ((area * manos) / rendimiento) * (1 + DESPERDICIO.pintura);
  const galones = haciaArriba(galonesExactos);
  const { cunetes, sueltos } = repartirEnCunetes(galones);
  const nota = `${numero(area)} m² × ${manos} ${manos === 1 ? "mano" : "manos"} ÷ ${rendimiento} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(galonesExactos)} galones`;

  const materiales: LineaMaterial[] = [];
  if (cunetes > 0) materiales.push({ material: "pintura-cunete", cantidad: cunetes, nota });
  if (sueltos > 0) materiales.push({ material: "pintura-galon", cantidad: sueltos, nota });
  if (entrada.opciones.sellador === "si") {
    const sellador = (area / PINTURA.rendimientoSelladorM2) * (1 + DESPERDICIO.pintura);
    materiales.push({
      material: "sellador",
      cantidad: haciaArriba(sellador),
      nota: `${numero(area)} m² ÷ ${PINTURA.rendimientoSelladorM2} m²/galón + ${DESPERDICIO.pintura * 100} % = ${numero(sellador)} galones`,
    });
  }

  return {
    materiales,
    datos: [
      { etiqueta: "Área a pintar", valor: `${numero(area)} m²` },
      { etiqueta: "Pintura necesaria", valor: `${galones} ${galones === 1 ? "galón" : "galones"}` },
    ],
  };
}

export const pintura: Calculadora = {
  slug: "pintura",
  titulo: "Pintura",
  descripcion: "Galones o cuñetes de pintura y el sellador, según el área y las manos.",
  icono: PaintRoller,
  diagrama: "pared",
  comoMedir: "Suma el largo de todas las paredes que vas a pintar y mide su alto. Resta puertas y ventanas.",
  campos: CAMPOS_PARED,
  grupos: [
    {
      id: "superficie",
      etiqueta: "Tipo de superficie",
      defecto: "lisa",
      opciones: [
        { valor: "lisa", etiqueta: "Lisa", detalle: "Friso liso o pared ya pintada." },
        { valor: "rugosa", etiqueta: "Rugosa", detalle: "Friso rústico o bloque: absorbe más." },
      ],
    },
    {
      id: "manos",
      etiqueta: "Número de manos",
      defecto: "2",
      opciones: [
        { valor: "1", etiqueta: "1 mano", detalle: "Retoque del mismo color." },
        { valor: "2", etiqueta: "2 manos", detalle: "Lo recomendado." },
        { valor: "3", etiqueta: "3 manos", detalle: "Cambio fuerte de color." },
      ],
    },
    {
      id: "sellador",
      etiqueta: "¿La pared es nueva?",
      defecto: "no",
      opciones: [
        { valor: "no", etiqueta: "Ya está pintada", detalle: "No hace falta sellador." },
        { valor: "si", etiqueta: "Es nueva", detalle: "Agregamos una mano de sellador." },
      ],
    },
  ],
  herramientas: ["rodillo", "bandeja", "brocha", "cinta-enmascarar", "espatula", "escalera"],
  materiales: ["pintura-cunete", "pintura-galon", "sellador"],
  calcular: calcularPintura,
  explicacion: [
    "Calculamos el área a pintar (largo × alto, menos puertas y ventanas).",
    "Un galón rinde unos 40 m² por mano en pared lisa y unos 30 m² en pared rugosa.",
    "Multiplicamos por el número de manos y sumamos 5 % de desperdicio.",
    "Si te salen 3 galones sueltos o más, te recomendamos un cuñete (4 galones), que sale mejor.",
    "En paredes nuevas agregamos una mano de sellador, que rinde unos 35 m² por galón.",
  ],
};

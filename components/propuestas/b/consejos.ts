import { DESPERDICIO, SOLAPE_EN_DIAMETROS } from "@/lib/calculadoras/constantes";
import type { Calculadora } from "@/lib/calculadoras/tipos";

// Propuesta B: consejos que acompañan a la calculadora elegida. NADA de cifras nuevas: todo sale de los datos que
// ya usan las calculadoras (comoMedir, ayuda de cada campo y los desperdicios de lib/calculadoras/constantes.ts).

type Extra = { texto: string; porcentaje: number };

/** Desperdicio que ya suma cada calculadora (mismo valor que usa su fórmula). */
const DESPERDICIO_POR_CALCULADORA: Record<string, Extra[]> = {
  bloques: [
    { texto: "Bloques", porcentaje: DESPERDICIO.bloques },
    { texto: "Mortero de pega", porcentaje: DESPERDICIO.mortero },
  ],
  concreto: [{ texto: "Concreto", porcentaje: DESPERDICIO.concreto }],
  friso: [{ texto: "Mortero del friso", porcentaje: DESPERDICIO.mortero }],
  cabillas: [],
  pintura: [{ texto: "Pintura y sellador", porcentaje: DESPERDICIO.pintura }],
  ceramica: [
    { texto: "Piezas colocadas en recto", porcentaje: DESPERDICIO.ceramicaRecta },
    { texto: "Piezas colocadas en diagonal", porcentaje: DESPERDICIO.ceramicaDiagonal },
    { texto: "Pego", porcentaje: DESPERDICIO.pego },
    { texto: "Carato", porcentaje: DESPERDICIO.carato },
  ],
  contrapiso: [
    { texto: "Mezcla con piedra (concreto)", porcentaje: DESPERDICIO.concreto },
    { texto: "Mezcla sin piedra (mortero)", porcentaje: DESPERDICIO.mortero },
  ],
  techo: [
    { texto: "Láminas", porcentaje: DESPERDICIO.laminasTecho },
    { texto: "Tornillos", porcentaje: DESPERDICIO.tornillosTecho },
  ],
  impermeabilizacion: [{ texto: "Manto o impermeabilizante", porcentaje: DESPERDICIO.impermeabilizacion }],
  drywall: [
    { texto: "Láminas", porcentaje: DESPERDICIO.laminasDrywall },
    { texto: "Perfiles", porcentaje: DESPERDICIO.rielesDrywall },
  ],
};

export type Consejos = {
  /** "Cómo medir" de la calculadora y, debajo, la ayuda de sus campos (sin repetir). */
  medir: string[];
  /** Lo que la calculadora ya suma por su cuenta. */
  incluido: string[];
};

export function consejosDe(calculadora: Calculadora): Consejos {
  const ayudas = calculadora.campos.map((c) => c.ayuda).filter((a): a is string => !!a);
  const medir = [calculadora.comoMedir, ...Array.from(new Set(ayudas))];

  const incluido = (DESPERDICIO_POR_CALCULADORA[calculadora.slug] ?? []).map(
    ({ texto, porcentaje }) => `${texto}: ${Math.round(porcentaje * 100)} % extra por desperdicio.`,
  );
  if (calculadora.slug === "cabillas") incluido.push(`El solape de ${SOLAPE_EN_DIAMETROS} veces el diámetro de la cabilla.`);
  incluido.push("Todo redondeado hacia arriba a unidades enteras de venta (sacos, galones, cajas…).");

  return { medir, incluido };
}

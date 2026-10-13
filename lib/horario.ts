// Horario de la tienda física (página /horario). ÚNICO lugar donde se cambia.
// Confirmado por persona A el 2026-10-12. Las horas son de Caracas (America/Caracas), sin importar
// la zona horaria del teléfono del cliente.

export type TipoDia = "semana" | "sabado-feriado" | "domingo";

/** Minutos desde la medianoche: 8:00 a. m. = 480. */
export type Franja = { abre: number; cierra: number };

export const HORARIO: Record<TipoDia, { dias: string; franja: Franja }> = {
  semana: { dias: "Lunes a viernes", franja: { abre: 8 * 60, cierra: 17 * 60 } },
  "sabado-feriado": { dias: "Sábados y feriados", franja: { abre: 8 * 60, cierra: 15 * 60 } },
  domingo: { dias: "Domingos", franja: { abre: 9 * 60, cierra: 14 * 60 } },
};

export const ZONA_HORARIA = "America/Caracas";

/** 480 → "8:00 a. m."; 1020 → "5:00 p. m." */
export function formatearHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

export function formatearFranja({ abre, cierra }: Franja): string {
  return `${formatearHora(abre)} a ${formatearHora(cierra)}`;
}

/** Fecha de calendario (sin hora), en Caracas. `diaSemana`: 0 = domingo … 6 = sábado. */
export type Dia = { anio: number; mes: number; dia: number; diaSemana: number };

export function ahoraEnCaracas(ahora: Date): Dia & { minutos: number } {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA_HORARIA,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(ahora)
      .map((p) => [p.type, p.value]),
  );
  const anio = Number(partes.year);
  const mes = Number(partes.month);
  const dia = Number(partes.day);
  return {
    anio,
    mes,
    dia,
    diaSemana: new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay(),
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

function sumarDias({ anio, mes, dia }: Dia, n: number): Dia {
  const f = new Date(Date.UTC(anio, mes - 1, dia + n));
  return { anio: f.getUTCFullYear(), mes: f.getUTCMonth() + 1, dia: f.getUTCDate(), diaSemana: f.getUTCDay() };
}

/** Domingo de Resurrección (algoritmo de Meeus/Jones/Butcher). */
function domingoDePascua(anio: number): Dia {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { anio, mes, dia, diaSemana: 0 };
}

/** Feriados nacionales (LOTTT art. 184 y Ley de Fiestas Patrias). */
export function feriadosDelAnio(anio: number): { dia: Dia; nombre: string }[] {
  const fijo = (mes: number, dia: number, nombre: string) => ({ dia: sumarDias({ anio, mes, dia, diaSemana: 0 }, 0), nombre });
  const pascua = domingoDePascua(anio);
  const movil = (n: number, nombre: string) => ({ dia: sumarDias(pascua, n), nombre });
  return [
    fijo(1, 1, "Año Nuevo"),
    movil(-48, "Lunes de Carnaval"),
    movil(-47, "Martes de Carnaval"),
    movil(-3, "Jueves Santo"),
    movil(-2, "Viernes Santo"),
    fijo(4, 19, "Declaración de la Independencia"),
    fijo(5, 1, "Día del Trabajador"),
    fijo(6, 24, "Batalla de Carabobo"),
    fijo(7, 5, "Día de la Independencia"),
    fijo(7, 24, "Natalicio de Simón Bolívar"),
    fijo(10, 12, "Día de la Resistencia Indígena"),
    fijo(12, 24, "Nochebuena"),
    fijo(12, 25, "Navidad"),
    fijo(12, 31, "Fin de Año"),
  ].sort((x, y) => x.dia.mes - y.dia.mes || x.dia.dia - y.dia.dia);
}

export function nombreFeriado({ anio, mes, dia }: Dia): string | null {
  return feriadosDelAnio(anio).find((f) => f.dia.mes === mes && f.dia.dia === dia)?.nombre ?? null;
}

/** Qué horario aplica ese día. Un feriado que cae domingo mantiene el horario de domingo. */
export function tipoDeDia(dia: Dia): TipoDia {
  if (dia.diaSemana === 0) return "domingo";
  if (dia.diaSemana === 6 || nombreFeriado(dia)) return "sabado-feriado";
  return "semana";
}

export type EstadoTienda = {
  abierta: boolean;
  tipoHoy: TipoDia;
  feriadoHoy: string | null;
  /** Frase lista para mostrar: "Cierra hoy a las 5:00 p. m.", "Abre mañana a las 8:00 a. m." */
  detalle: string;
};

export function estadoTienda(ahora: Date): EstadoTienda {
  const hoy = ahoraEnCaracas(ahora);
  const tipoHoy = tipoDeDia(hoy);
  const { abre, cierra } = HORARIO[tipoHoy].franja;
  const base = { tipoHoy, feriadoHoy: nombreFeriado(hoy) };

  if (hoy.minutos >= abre && hoy.minutos < cierra) {
    return { ...base, abierta: true, detalle: `Cierra hoy a las ${formatearHora(cierra)}` };
  }
  if (hoy.minutos < abre) {
    return { ...base, abierta: false, detalle: `Abre hoy a las ${formatearHora(abre)}` };
  }
  const manana = sumarDias(hoy, 1);
  return { ...base, abierta: false, detalle: `Abre mañana a las ${formatearHora(HORARIO[tipoDeDia(manana)].franja.abre)}` };
}

/** Los próximos feriados desde hoy (incluido), para avisar con tiempo. */
export function proximosFeriados(ahora: Date, cantidad = 3): { dia: Dia; nombre: string }[] {
  const hoy = ahoraEnCaracas(ahora);
  const clave = (d: Dia) => d.anio * 10000 + d.mes * 100 + d.dia;
  return [...feriadosDelAnio(hoy.anio), ...feriadosDelAnio(hoy.anio + 1)]
    .filter((f) => clave(f.dia) >= clave(hoy))
    .slice(0, cantidad);
}

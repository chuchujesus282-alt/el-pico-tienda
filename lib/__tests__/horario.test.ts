import { describe, expect, it } from "vitest";
import { estadoTienda, feriadosDelAnio, formatearHora, tipoDeDia } from "@/lib/horario";

// Caracas está en UTC-4 todo el año: 10:00 en Caracas = 14:00Z.
const caracas = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00-04:00`);

describe("formatearHora", () => {
  it("usa a. m. / p. m. con reloj de 12 horas", () => {
    expect(formatearHora(8 * 60)).toBe("8:00 a. m.");
    expect(formatearHora(12 * 60)).toBe("12:00 p. m.");
    expect(formatearHora(17 * 60)).toBe("5:00 p. m.");
  });
});

describe("feriados", () => {
  it("calcula Carnaval y Semana Santa a partir de la Pascua", () => {
    const nombres = (anio: number) => feriadosDelAnio(anio).map((f) => `${f.dia.mes}-${f.dia.dia} ${f.nombre}`);
    // Pascua 2026: 5 de abril.
    expect(nombres(2026)).toContain("2-16 Lunes de Carnaval");
    expect(nombres(2026)).toContain("4-2 Jueves Santo");
    expect(nombres(2026)).toContain("4-3 Viernes Santo");
  });

  it("un feriado entre semana usa el horario de sábado; uno en domingo, el de domingo", () => {
    expect(tipoDeDia({ anio: 2026, mes: 10, dia: 12, diaSemana: 1 })).toBe("sabado-feriado");
    expect(tipoDeDia({ anio: 2026, mes: 7, dia: 5, diaSemana: 0 })).toBe("domingo");
  });
});

describe("estadoTienda", () => {
  it("lunes a viernes: abierta de 8:00 a. m. a 5:00 p. m.", () => {
    expect(estadoTienda(caracas("2026-10-13", "10:00"))).toMatchObject({ abierta: true, detalle: "Cierra hoy a las 5:00 p. m." });
    expect(estadoTienda(caracas("2026-10-13", "17:00"))).toMatchObject({ abierta: false, detalle: "Abre mañana a las 8:00 a. m." });
  });

  it("feriado: cierra a las 3:00 p. m.", () => {
    expect(estadoTienda(caracas("2026-10-12", "14:59"))).toMatchObject({
      abierta: true,
      feriadoHoy: "Día de la Resistencia Indígena",
      detalle: "Cierra hoy a las 3:00 p. m.",
    });
    expect(estadoTienda(caracas("2026-10-12", "15:00")).abierta).toBe(false);
  });

  it("sábado: antes de abrir avisa la hora; al cerrar avisa el horario del domingo", () => {
    expect(estadoTienda(caracas("2026-10-17", "07:30"))).toMatchObject({ abierta: false, detalle: "Abre hoy a las 8:00 a. m." });
    expect(estadoTienda(caracas("2026-10-17", "15:30"))).toMatchObject({ abierta: false, detalle: "Abre mañana a las 9:00 a. m." });
  });

  it("domingo: abierta de 9:00 a. m. a 2:00 p. m.", () => {
    expect(estadoTienda(caracas("2026-10-18", "08:59")).abierta).toBe(false);
    expect(estadoTienda(caracas("2026-10-18", "13:59"))).toMatchObject({ abierta: true, detalle: "Cierra hoy a las 2:00 p. m." });
  });
});

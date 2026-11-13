import { describe, expect, it } from "vitest";
import { elegirEscenaGriferia, escenaDelDia } from "../escenaGriferia";

describe("escena del banner de Grifería", () => {
  it("1 de enero (día 0) es ducha y el 2 de enero es lavamanos", () => {
    expect(escenaDelDia(new Date(2026, 0, 1, 12))).toBe("ducha");
    expect(escenaDelDia(new Date(2026, 0, 2, 0, 5))).toBe("lavamanos");
  });
  it("alterna cada día, también al cruzar de mes", () => {
    expect(escenaDelDia(new Date(2026, 0, 31))).toBe("ducha"); // día 30
    expect(escenaDelDia(new Date(2026, 1, 1))).toBe("lavamanos"); // día 31
  });
  it("no depende de la hora del día", () => {
    expect(escenaDelDia(new Date(2026, 10, 12, 0, 1))).toBe(escenaDelDia(new Date(2026, 10, 12, 23, 59)));
  });
  it("?escena fuerza la escena; un valor desconocido usa la del día", () => {
    const fecha = new Date(2026, 0, 1);
    expect(elegirEscenaGriferia("lavamanos", fecha)).toBe("lavamanos");
    expect(elegirEscenaGriferia("ducha", new Date(2026, 0, 2))).toBe("ducha");
    expect(elegirEscenaGriferia("otra", fecha)).toBe("ducha");
    expect(elegirEscenaGriferia(null, fecha)).toBe("ducha");
  });
});

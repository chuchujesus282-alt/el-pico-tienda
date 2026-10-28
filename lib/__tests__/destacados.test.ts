import { describe, expect, it } from "vitest";
import { muestraSaint } from "@/lib/__tests__/datos/muestraSaint";
import { diaDeHoy, elegirDestacados, mezclaDelDia } from "../destacados";

describe("destacados del inicio", () => {
  it("los códigos elegidos a mano van primero y en su orden; los que no existen se saltan", () => {
    const [a, b] = muestraSaint;
    const r = elegirDestacados(muestraSaint, { codigos: [b.id, "NO-EXISTE", a.id], limite: 5, dia: "2026-10-28" });
    expect(r.slice(0, 2).map((p) => p.id)).toEqual([b.id, a.id]);
    expect(r).toHaveLength(5); // el resto, de la mezcla
    expect(new Set(r.map((p) => p.id)).size).toBe(5);
  });

  it("mezcla del día: un producto por subcategoría, variada entre categorías, la misma todo el día", () => {
    const hoy = mezclaDelDia(muestraSaint, 10, "2026-10-28");
    expect(hoy).toHaveLength(10);
    expect(new Set(hoy.map((p) => p.categoriaSlug)).size).toBe(10); // las 10 categorías
    expect(new Set(hoy.map((p) => `${p.categoriaSlug}|${p.subcategoria}`)).size).toBe(10);
    expect(mezclaDelDia(muestraSaint, 10, "2026-10-28").map((p) => p.id)).toEqual(hoy.map((p) => p.id));
    expect(mezclaDelDia(muestraSaint, 10, "2026-10-29").map((p) => p.id)).not.toEqual(hoy.map((p) => p.id));
  });

  it("con categoría, solo productos de esa categoría", () => {
    const r = elegirDestacados(muestraSaint, { categoria: "griferia", limite: 6, dia: "2026-10-28" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.categoriaSlug === "griferia")).toBe(true);
  });

  it("el día es el de Caracas", () => {
    // 2026-10-29 02:00 UTC = 2026-10-28 22:00 en Caracas.
    expect(diaDeHoy(new Date(Date.UTC(2026, 9, 29, 2)))).toBe("2026-10-28");
  });
});

import { describe, expect, it } from "vitest";
import { Mejores } from "../productos";

// Mejores reemplaza a "ordenar todo y cortar" en similaresDe y masVendidos: tiene que dar EXACTAMENTE lo mismo,
// también en los empates (el sort de JavaScript es estable: a igual puntaje, el que aparece antes).
describe("Mejores", () => {
  const comparar = (a: { v: number }, b: { v: number }) => b.v - a.v;

  it("da lo mismo que sort + slice, con muchos empates", () => {
    let semilla = 7;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let vuelta = 0; vuelta < 50; vuelta++) {
      const items = Array.from({ length: 300 }, (_, i) => ({ i, v: Math.floor(azar() * 8) }));
      for (const limite of [0, 1, 4, 10, 500]) {
        const mejores = new Mejores(limite, comparar);
        for (const item of items) mejores.ofrecer(item);
        expect(mejores.resultado()).toEqual([...items].sort(comparar).slice(0, limite));
      }
    }
  });
});

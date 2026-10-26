import { describe, expect, it } from "vitest";
import { MAX_CANTIDAD, MAX_LINEAS, limpiarCarrito, limpiarFavoritos, mezclarCarrito, mezclarFavoritos } from "../mezclaCuenta";

describe("mezclarCarrito", () => {
  it("si el producto está en los dos lados, queda la cantidad mayor (no la suma)", () => {
    expect(mezclarCarrito([{ id: "A", cantidad: 2 }], [{ id: "A", cantidad: 5 }])).toEqual([{ id: "A", cantidad: 5 }]);
    expect(mezclarCarrito([{ id: "A", cantidad: 7 }], [{ id: "A", cantidad: 5 }])).toEqual([{ id: "A", cantidad: 7 }]);
  });

  it("junta los dos lados: primero lo de la cuenta, luego lo nuevo del navegador", () => {
    expect(
      mezclarCarrito(
        [
          { id: "C", cantidad: 1 },
          { id: "A", cantidad: 3 },
        ],
        [
          { id: "A", cantidad: 1 },
          { id: "B", cantidad: 2 },
        ],
      ),
    ).toEqual([
      { id: "A", cantidad: 3 },
      { id: "B", cantidad: 2 },
      { id: "C", cantidad: 1 },
    ]);
  });

  it("con uno de los lados vacío, queda el otro", () => {
    expect(mezclarCarrito([], [{ id: "A", cantidad: 1 }])).toEqual([{ id: "A", cantidad: 1 }]);
    expect(mezclarCarrito([{ id: "A", cantidad: 1 }], [])).toEqual([{ id: "A", cantidad: 1 }]);
  });
});

describe("mezclarFavoritos", () => {
  it("une los dos lados sin repetir, primero los del navegador", () => {
    expect(mezclarFavoritos(["C", "A"], ["A", "B"])).toEqual(["C", "A", "B"]);
  });
});

describe("limpiarCarrito", () => {
  it("descarta lo que no es válido y redondea cantidades", () => {
    expect(
      limpiarCarrito([
        { id: "A", cantidad: 2.7 },
        { id: "", cantidad: 1 },
        { id: "B", cantidad: 0 },
        { id: "C", cantidad: -3 },
        { id: "D", cantidad: Number.NaN },
        { id: "E", cantidad: "2" },
        { id: "x".repeat(65), cantidad: 1 },
        { id: "A", cantidad: 9 },
        null,
        { id: "F", cantidad: 1e9 },
      ]),
    ).toEqual([
      { id: "A", cantidad: 2 },
      { id: "F", cantidad: MAX_CANTIDAD },
    ]);
  });

  it("no acepta más de MAX_LINEAS ni cosas que no son listas", () => {
    const muchas = Array.from({ length: MAX_LINEAS + 50 }, (_, i) => ({ id: `P${i}`, cantidad: 1 }));
    expect(limpiarCarrito(muchas)).toHaveLength(MAX_LINEAS);
    expect(limpiarCarrito("hola")).toEqual([]);
  });
});

describe("limpiarFavoritos", () => {
  it("solo códigos válidos y sin repetir", () => {
    expect(limpiarFavoritos(["A", "A", 3, "", "B", null])).toEqual(["A", "B"]);
    expect(limpiarFavoritos({})).toEqual([]);
  });
});

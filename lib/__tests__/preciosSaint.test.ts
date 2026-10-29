import { describe, expect, it } from "vitest";
import { enTandas, esCodigoValido, leerPrecios } from "@/lib/preciosSaint";

const PERMITIDAS = new Set([1171, 1498]);

// Como responde &codigos=: categoria null, codigos (lo pedido), instancias vacías y los productos que siguen a la venta.
const respuesta = {
  tasa: 888.89,
  categoria: null,
  codigos: ["ACS0082", "3M0015", "NOEXISTE", "RARO01", "NOPEDI"],
  total: 4,
  subcategorias: [],
  instancias: [],
  productos: [
    { codigo: "3M0015", codCategoria: 1171, precioUsd: 79.15, precioBs: 70356.95 },
    { codigo: "ACS0082", codCategoria: 1171, precioUsd: 7.94, precioBs: 7055.74 },
    { codigo: "RARO01", codCategoria: 1, precioUsd: 3, precioBs: 2666.67 }, // categoría que no es de la web
    { codigo: "NOPEDI", codCategoria: 1498, precioUsd: 5, precioBs: 4444.45 }, // no se pidió
  ],
};

describe("leerPrecios", () => {
  it("da el precio de hoy de lo pedido y marca lo que ya no está a la venta", () => {
    const { precios, retirados } = leerPrecios(respuesta, ["ACS0082", "3M0015", "NOEXISTE"], PERMITIDAS);
    expect(precios.get("ACS0082")).toEqual({ precio: 7.94, precioBs: 7055.74, tasa: 888.89 });
    expect(precios.get("3M0015")?.precio).toBe(79.15);
    expect(retirados).toEqual(["NOEXISTE"]);
  });

  it("ignora productos de categorías que no son de la web (ni aunque se hayan pedido)", () => {
    const { precios, retirados } = leerPrecios(respuesta, ["RARO01"], PERMITIDAS);
    expect(precios.size).toBe(0);
    expect(retirados).toEqual(["RARO01"]);
  });

  it("ignora lo que no se pidió", () => {
    const { precios } = leerPrecios(respuesta, ["ACS0082"], PERMITIDAS);
    expect([...precios.keys()]).toEqual(["ACS0082"]);
  });

  it("un precio que no es válido cuenta como que ya no está a la venta", () => {
    const sinPrecio = { ...respuesta, productos: [{ codigo: "ACS0082", codCategoria: 1171, precioUsd: 0 }] };
    expect(leerPrecios(sinPrecio, ["ACS0082"], PERMITIDAS).retirados).toEqual(["ACS0082"]);
  });

  it("una respuesta sin lista de productos es un error, no 'nada a la venta'", () => {
    expect(() => leerPrecios({ error: "x" }, ["ACS0082"], PERMITIDAS)).toThrow();
  });
});

describe("enTandas y esCodigoValido", () => {
  it("parte en tandas de 50 sin repetir", () => {
    const codigos = Array.from({ length: 120 }, (_, i) => `C${i}`);
    expect(enTandas([...codigos, "C0", "C1"]).map((t) => t.length)).toEqual([50, 50, 20]);
  });

  it("acepta lo mismo que la API: letras, números y . _ - /", () => {
    expect(esCodigoValido("ACS0082")).toBe(true);
    expect(esCodigoValido("PIN-01/A.2_b")).toBe(true);
    expect(esCodigoValido("A B")).toBe(false);
    expect(esCodigoValido("A,B")).toBe(false);
  });
});

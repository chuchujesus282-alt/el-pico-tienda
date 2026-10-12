import { describe, expect, it } from "vitest";
import complementariosJson from "@/datos/complementarios.json";
import consumiblesJson from "@/datos/consumibles.json";
import sinonimosJson from "@/datos/sinonimos.json";
import { palabrasClave } from "../normalizar";

describe("normalización", () => {
  it("quita mayúsculas y acentos, y pasa a singular", () => {
    expect(palabrasClave("TORNILLOS")).toEqual(palabrasClave("tornillo"));
    expect(palabrasClave("Conexiones")).toEqual(palabrasClave("conexión"));
    expect(palabrasClave("cables")).toEqual(palabrasClave("cable"));
    expect(palabrasClave("luces")).toEqual(palabrasClave("luz"));
  });

  it("unifica las medidas", () => {
    const cuarto = palabrasClave("1/4");
    for (const forma of ['1/4"', "¼", "un cuarto", "1/4 pulg", "1/4 pulgadas", "un cuarto de pulgada", "2/8"]) {
      expect(palabrasClave(forma), forma).toEqual(cuarto);
    }
    expect(palabrasClave('3/8"')).toEqual(palabrasClave("tres octavos"));
    expect(palabrasClave('1/2"')).toEqual(palabrasClave("media pulgada"));
    expect(palabrasClave('3/4"')).toEqual(palabrasClave("¾"));
    expect(palabrasClave('1"')).toEqual(palabrasClave("1 pulgada"));
    expect(palabrasClave('1 1/2"')).toEqual(palabrasClave("1-1/2 pulg"));
    expect(palabrasClave("5MTS")).toEqual(palabrasClave("5 metros"));
    expect(palabrasClave("42.5KG")).toEqual(palabrasClave("42,5 kilos"));
  });

  it("no confunde dos medidas seguidas", () => {
    expect(palabrasClave('1/4" X 1 1/2"')).toEqual(["1/4", "1-1/2"]);
    expect(palabrasClave("1/2 3/4")).toEqual(["1/2", "3/4"]);
  });

  it("aplica los sinónimos venezolanos", () => {
    const pares: [string, string][] = [
      ["mecha", "broca"],
      ["teipe", "cinta aislante"],
      ["tirro", "cinta de papel"],
      ["pega", "pegamento"],
      ["varilla", "cabilla"],
      ["foco", "bombillo"],
      ["llave inglesa", "llave ajustable"],
      ["taco", "ramplug"],
      ["tarugo", "ramplug"],
      ["sierra de arco", "segueta"],
      ["desarmador", "destornillador"],
    ];
    for (const [variante, principal] of pares) {
      expect(palabrasClave(variante), variante).toEqual(palabrasClave(principal));
    }
    expect(palabrasClave("mechas 3/8")).toEqual(palabrasClave("broca 3/8\""));
  });
});

describe("diccionarios editables (datos/)", () => {
  it("sinonimos.json: grupos de 2 o más palabras de texto", () => {
    for (const grupo of sinonimosJson.grupos) {
      expect(grupo.length, JSON.stringify(grupo)).toBeGreaterThanOrEqual(2);
      grupo.forEach((p) => expect(typeof p).toBe("string"));
    }
  });

  it("complementarios.json: cada tipo tiene una lista de complementos", () => {
    for (const [tipo, lista] of Object.entries(complementariosJson.complementos)) {
      expect(Array.isArray(lista), tipo).toBe(true);
      expect(palabrasClave(tipo).length, tipo).toBeGreaterThan(0);
    }
  });

  it("consumibles.json: lista de tipos", () => {
    expect(consumiblesJson.tipos.every((t) => palabrasClave(t).length > 0)).toBe(true);
  });
});

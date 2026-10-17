import { describe, expect, it } from "vitest";
import { enlaceMapa, posicionEnMosaico, textoDireccion, ubicacionValida, validarDireccion } from "@/lib/direcciones";

const caracas = { latitud: 10.488, longitud: -66.8792 };

describe("validarDireccion", () => {
  it("acepta una dirección completa", () => {
    expect(validarDireccion({ nombre: "Casa", descripcion: "Edif. Los Pinos, piso 4", ...caracas })).toEqual({});
  });

  it("pide nombre, descripción y un punto en Venezuela", () => {
    const errores = validarDireccion({ nombre: " ", descripcion: "abc", latitud: 40.4, longitud: -3.7 });
    expect(Object.keys(errores).sort()).toEqual(["descripcion", "nombre", "ubicacion"]);
  });

  it("no acepta textos demasiado largos", () => {
    const errores = validarDireccion({ nombre: "x".repeat(31), descripcion: "y".repeat(121), ...caracas });
    expect(errores.nombre).toBeDefined();
    expect(errores.descripcion).toBeDefined();
  });
});

describe("ubicacionValida", () => {
  it("rechaza números que no son coordenadas", () => {
    expect(ubicacionValida({ latitud: Number.NaN, longitud: -66.9 })).toBe(false);
    expect(ubicacionValida(caracas)).toBe(true);
  });
});

describe("texto para WhatsApp", () => {
  it("lleva el nombre, la descripción y el enlace al mapa", () => {
    const texto = textoDireccion({ id: "a", nombre: "Obra", descripcion: "Casa 12, portón negro", ...caracas });
    expect(texto).toBe("Obra (Casa 12, portón negro). Ubicación: https://www.google.com/maps?q=10.488000,-66.879200");
    expect(enlaceMapa(caracas)).toContain("q=10.488000,-66.879200");
  });
});

describe("posicionEnMosaico", () => {
  it("ubica el punto dentro de su mosaico de 256 px", () => {
    const p = posicionEnMosaico(caracas, 16);
    expect(p).toMatchObject({ x: 20593, y: 30847 });
    expect(p.px).toBeGreaterThanOrEqual(0);
    expect(p.px).toBeLessThan(256);
    expect(p.py).toBeGreaterThanOrEqual(0);
    expect(p.py).toBeLessThan(256);
  });
});

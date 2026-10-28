import { describe, expect, it } from "vitest";
import { ancestros, armarArbol, codigoPorNombre, navegacion, rutaDe } from "../arbolSaint";
import { nombreLegible } from "../nombresSaint";

// Un pedazo del árbol real de Construcción (1498) en Saint, con una rama vacía.
const CONSTRUCCION = 1498;
const instancias = [
  { codigo: 1499, nombre: "MATERIALES DE CONSTRUCCION", padre: 1498, codCategoria: 1498 },
  { codigo: 1500, nombre: "GRUPO QUIMICO", padre: 1498, codCategoria: 1498 },
  { codigo: 1600, nombre: "AGUA Y TUBERIA", padre: 1499, codCategoria: 1498 },
  { codigo: 1601, nombre: "OBRA GRIS", padre: 1499, codCategoria: 1498 },
  { codigo: 1610, nombre: "TUBOS Y CONEXIONES", padre: 1600, codCategoria: 1498 },
  { codigo: 1611, nombre: "TANQUES", padre: 1600, codCategoria: 1498 },
  { codigo: 1620, nombre: "PLASTICO", padre: 1610, codCategoria: 1498 },
  { codigo: 1630, nombre: "TERMOFUSION", padre: 1620, codCategoria: 1498 },
  { codigo: 1640, nombre: "AMARILLA GAS", padre: 1630, codCategoria: 1498 },
  { codigo: 1700, nombre: "RAMA SIN PRODUCTOS", padre: 1499, codCategoria: 1498 },
  { codigo: 1701, nombre: "HIJA SIN PRODUCTOS", padre: 1700, codCategoria: 1498 },
];
// Productos en: Amarilla gas (nivel 6), Tanques (nivel 3), Obra gris (nivel 2) y Grupo químico (nivel 1).
const conProductos = [1640, 1611, 1601, 1500];
const arbol = armarArbol(instancias, CONSTRUCCION, conProductos, (n) => nombreLegible(n));

describe("árbol de subcategorías de Saint", () => {
  it("arma los niveles con nombres legibles y en el orden de Saint", () => {
    expect(arbol.raices).toEqual([1499, 1500]);
    expect(arbol.nodos.get(1499)!.nombre).toBe("Materiales de construcción");
    expect(arbol.nodos.get(1499)!.hijas).toEqual([1600, 1601]);
    expect(arbol.nodos.get(1630)!.nombre).toBe("Termofusión");
  });

  it("quita las ramas sin productos (ni en ellas ni debajo)", () => {
    expect(arbol.nodos.has(1700)).toBe(false);
    expect(arbol.nodos.has(1701)).toBe(false);
  });

  it("ruta del primer nivel al actual, hasta 6 niveles", () => {
    expect(rutaDe(arbol, 1640)).toEqual([1499, 1600, 1610, 1620, 1630, 1640]);
    expect(rutaDe(arbol, 9999)).toEqual([]);
  });

  it("un producto está en su instancia y en todas las de arriba (para filtrar por cualquier nivel)", () => {
    const deAmarilla = ancestros(arbol, 1640);
    expect([1499, 1600, 1610, 1640].every((c) => deAmarilla.has(c))).toBe(true);
    expect(deAmarilla.has(1601)).toBe(false);
    expect(ancestros(arbol, undefined).size).toBe(0);
  });

  it('en "Todas": el primer nivel, sin ruta', () => {
    const nav = navegacion(arbol, undefined);
    expect(nav.actual).toBeNull();
    expect(nav.ruta).toEqual([]);
    expect(nav.opciones.map((o) => o.codigo)).toEqual([1499, 1500]);
    expect(nav.opciones[0].tieneHijas).toBe(true);
    expect(nav.opciones[1].tieneHijas).toBe(false);
  });

  it("en un nivel intermedio: sus hijas y la ruta para volver", () => {
    const nav = navegacion(arbol, 1600);
    expect(nav.actual).toEqual({ codigo: 1600, nombre: "Agua y tubería" });
    expect(nav.ruta.map((r) => r.nombre)).toEqual(["Materiales de construcción", "Agua y tubería"]);
    expect(nav.opciones.map((o) => o.codigo)).toEqual([1610, 1611]);
    expect(nav.sonHermanas).toBe(false);
  });

  it("en el último nivel: sus hermanas, con la actual (para marcarla)", () => {
    const nav = navegacion(arbol, 1611);
    expect(nav.sonHermanas).toBe(true);
    expect(nav.opciones.map((o) => o.codigo)).toEqual([1610, 1611]);
    const primerNivel = navegacion(arbol, 1500); // hoja del primer nivel: sus hermanas son el primer nivel
    expect(primerNivel.sonHermanas).toBe(true);
    expect(primerNivel.opciones.map((o) => o.codigo)).toEqual([1499, 1500]);
  });

  it('un código que no es de la categoría (o quedó vacío) es "Todas"', () => {
    expect(navegacion(arbol, 1700).actual).toBeNull();
    expect(navegacion(arbol, 123456).actual).toBeNull();
  });

  it("los enlaces viejos (?subcategoria=Nombre) se traducen a su código de primer nivel", () => {
    expect(codigoPorNombre(arbol, "Grupo químico")).toBe(1500);
    expect(codigoPorNombre(arbol, "No existe")).toBeUndefined();
  });

  it("no se cuelga si Saint mandara un ciclo", () => {
    const ciclo = armarArbol(
      [
        { codigo: 1, nombre: "A", padre: 2 },
        { codigo: 2, nombre: "B", padre: 1 },
      ],
      999,
      [1],
      (n) => n,
    );
    expect(rutaDe(ciclo, 1).length).toBeLessThanOrEqual(2);
  });
});

describe("acentos de los niveles del árbol", () => {
  it.each([
    ["DIMENSIONES Y NIVELACION", "Dimensiones y nivelación"],
    ["DE COMPRESION", "De compresión"],
    ["KIT DE HERRAMIENTAS PARA TAPICERIA", "Kit de herramientas para tapicería"],
    ["MANOMETROS", "Manómetros"],
    ["BUJIAS", "Bujías"],
    ["PRODUCTOS ASFALTICOS", "Productos asfálticos"],
    ["ELECTRODOMESTICOS", "Electrodomésticos"],
    ["ESCALERA TELESCOPICA", "Escalera telescópica"],
  ])("%s → %s", (crudo, esperado) => {
    expect(nombreLegible(crudo)).toBe(esperado);
  });
});

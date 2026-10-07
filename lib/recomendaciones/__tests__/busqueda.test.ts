import { describe, expect, it } from "vitest";
import { productosMock } from "@/lib/mock/productos";
import type { Producto } from "@/types/catalogo";
import { buscar, crearIndice, sugerir } from "../busqueda";
import { palabrasClave } from "../normalizar";

const indice = crearIndice(productosMock);
const nombres = (productos: Producto[]) => productos.map((p) => p.nombre);
const ids = (productos: Producto[]) => productos.map((p) => p.id);

describe("búsqueda inteligente", () => {
  it('"tornilo" (con error) encuentra tornillos', () => {
    const r = buscar(indice, "tornilo");
    expect(r.productos.length).toBeGreaterThan(0);
    expect(nombres(r.productos).every((n) => n.startsWith("TORNILLO"))).toBe(true);
  });

  it('"1/4 tornillos" y "tornillo 1/4" dan lo mismo, primero los tornillos de 1/4', () => {
    const a = buscar(indice, "1/4 tornillos");
    const b = buscar(indice, "tornillo 1/4");
    expect(ids(a.productos)).toEqual(ids(b.productos));
    expect(a.productos.length).toBeGreaterThan(0);
    for (const p of a.productos) {
      expect(p.nombre).toMatch(/^TORNILLO/);
      expect(palabrasClave(p.nombre)).toContain("1/4");
    }
  });

  it('"mecha 3/8" encuentra brocas de 3/8', () => {
    const r = buscar(indice, "mecha 3/8");
    expect(r.tipo).toBe("completo");
    expect(r.productos.length).toBeGreaterThan(0);
    expect(nombres(r.productos).every((n) => n.startsWith("BROCA") && n.includes('3/8"'))).toBe(true);
  });

  it('"teipe" encuentra cinta aislante', () => {
    expect(nombres(buscar(indice, "teipe").productos)[0]).toMatch(/^CINTA AISLANTE/);
  });

  it("acepta medidas escritas de otras formas", () => {
    expect(ids(buscar(indice, "broca tres octavos").productos)).toEqual(ids(buscar(indice, 'broca 3/8"').productos));
    expect(ids(buscar(indice, "tornillo ¼").productos)).toEqual(ids(buscar(indice, "tornillo 1/4 pulg").productos));
  });

  it("ordena: coincidencia exacta primero; a igualdad, el más vendido", () => {
    const r = buscar(indice, "cemento");
    expect(r.productos[0].nombre).toBe("CEMENTO GRIS SACO 42.5KG"); // 520 ventas vs. 90 del blanco
  });

  it("sugerencias en vivo con la palabra a medio escribir", () => {
    expect(nombres(sugerir(indice, "taladr"))[0]).toMatch(/^TALADRO/);
    expect(sugerir(indice, "")).toEqual([]);
  });

  it("sin resultados: ¿Quisiste decir…? y productos de la categoría más cercana, nunca vacío", () => {
    const r = buscar(indice, "carretiya");
    // "carretiya" está a 1 letra de "carretilla": la encuentra directo gracias a la tolerancia a errores.
    expect(r.productos.length).toBeGreaterThan(0);

    const nada = buscar(indice, "xyzw qwerty");
    expect(nada.tipo).toBe("ninguno");
    expect(nada.alternativos.length).toBeGreaterThan(0);

    const casi = buscar(indice, "impermiabilisante");
    expect(casi.productos.length + casi.alternativos.length).toBeGreaterThan(0);
    if (casi.tipo !== "completo") expect(casi.sugerencia).toContain("impermeabilizante");
  });
});

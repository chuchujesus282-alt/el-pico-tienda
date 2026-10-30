import { describe, expect, it } from "vitest";
import { muestraSaint } from "@/lib/__tests__/datos/muestraSaint";
import type { Producto } from "@/types/catalogo";
import { buscar, crearIndice, sugerir, sugerirCorrigiendo } from "../busqueda";
import { palabrasClave } from "../normalizar";

// Sobre productos REALES de Saint (lib/__tests__/datos/muestraSaint.ts): nombres como vienen del sistema, con marcas
// delante ("BRUFER MARTILLO…") y abreviaturas ("TOR" = tornillo, "MECHA" = broca).
const indice = crearIndice(muestraSaint);
const nombres = (productos: Producto[]) => productos.map((p) => p.nombre);
const ids = (productos: Producto[]) => productos.map((p) => p.id);

describe("búsqueda inteligente", () => {
  it('sugerencias en vivo: "martiyo" se corrige a martillo y lo avisa', () => {
    const r = sugerirCorrigiendo(indice, "martiyo");
    expect(r.correccion).toBe("martillo");
    expect(r.productos.length).toBeGreaterThan(0);
    expect(nombres(r.productos).every((n) => n.includes("MARTILLO"))).toBe(true);
  });

  it("sugerencias en vivo: si lo escrito ya encuentra algo, no se corrige", () => {
    const r = sugerirCorrigiendo(indice, "taladro");
    expect(r.correccion).toBeNull();
    expect(ids(r.productos)).toEqual(ids(sugerir(indice, "taladro")));
  });

  it('"tornilo" (con error) encuentra tornillos, también los que Saint abrevia "TOR"', () => {
    const r = buscar(indice, "tornilo");
    expect(r.productos.length).toBeGreaterThan(0);
    // "TOR" es sinónimo de tornillo (datos/sinonimos.json): los primeros son tornillos. Más abajo pueden salir
    // arandelas o tuercas, que están en la subcategoría "Complementos de tornillería".
    for (const p of r.productos.slice(0, 5)) expect(palabrasClave(p.nombre), p.nombre).toContain("tornillo");
    expect(nombres(r.productos).some((n) => n.startsWith("TOR "))).toBe(true);
  });

  it('"1/4 tornillos" y "tornillo 1/4" dan lo mismo: tornillos de 1/4', () => {
    const a = buscar(indice, "1/4 tornillos");
    const b = buscar(indice, "tornillo 1/4");
    expect(ids(a.productos)).toEqual(ids(b.productos));
    for (const p of a.productos) expect(palabrasClave(p.nombre)).toContain("1/4");
    // Ojo: "TOR ALLEN CIL NC 1/4-20x1" (medida con su rosca) todavía NO cuenta como 1/4: hueco conocido del motor.
    expect(nombres(a.productos).some((n) => n.startsWith("TOR "))).toBe(true);
  });

  it('"mecha 3/8" y "broca 3/8" encuentran las mechas de 3/8', () => {
    const r = buscar(indice, "mecha 3/8");
    expect(r.tipo).toBe("completo");
    expect(r.productos.length).toBeGreaterThan(0);
    // Algunos empiezan con la marca ("MAKITA MECHA SDS PLUS 3/8…").
    expect(nombres(r.productos).every((n) => n.includes("MECHA") && n.includes("3/8"))).toBe(true);
    expect(ids(buscar(indice, "broca 3/8").productos)).toEqual(ids(r.productos));
  });

  it('"teipe" encuentra el teipe y la cinta aislante entre los primeros', () => {
    const primeros = nombres(buscar(indice, "teipe").productos.slice(0, 6));
    expect(primeros.some((n) => n.includes("TEIPE"))).toBe(true);
    expect(primeros.some((n) => n.includes("CINTA AISLANTE"))).toBe(true);
  });

  it("acepta medidas escritas de otras formas", () => {
    expect(ids(buscar(indice, "broca tres octavos").productos)).toEqual(ids(buscar(indice, 'broca 3/8"').productos));
    expect(ids(buscar(indice, "tornillo ¼").productos)).toEqual(ids(buscar(indice, "tornillo 1/4 pulg").productos));
  });

  it("a igual coincidencia, primero el más vendido (cuando Saint mande las ventas)", () => {
    const cementos = muestraSaint.filter((p) => /^CEMENTO (GRIS|BLANCO) POR KILO/.test(p.nombre));
    expect(cementos).toHaveLength(2);
    const [blanco, gris] = [cementos.find((p) => p.nombre.includes("BLANCO"))!, cementos.find((p) => p.nombre.includes("GRIS"))!];
    const conVentas = crearIndice([{ ...blanco, ventas: 90 }, { ...gris, ventas: 520 }]);
    expect(buscar(conVentas, "cemento por kilo").productos[0].id).toBe(gris.id);
  });

  it("sugerencias en vivo con la palabra a medio escribir", () => {
    expect(nombres(sugerir(indice, "taladr"))[0]).toMatch(/TALADRO/);
    expect(sugerir(indice, "")).toEqual([]);
  });

  it("sin resultados: ¿Quisiste decir…? y productos de la categoría más cercana, nunca vacío", () => {
    const r = buscar(indice, "carretiya");
    // "carretiya" está a 1 letra de "carretilla": la encuentra directo gracias a la tolerancia a errores.
    expect(r.productos.length).toBeGreaterThan(0);
    expect(nombres(r.productos)[0]).toMatch(/CARRETILLA/);

    const nada = buscar(indice, "xyzw qwerty");
    expect(nada.tipo).toBe("ninguno");
    expect(nada.alternativos.length).toBeGreaterThan(0);

    const casi = buscar(indice, "impermiabilisante");
    expect(casi.productos.length + casi.alternativos.length).toBeGreaterThan(0);
    if (casi.tipo !== "completo") expect(casi.sugerencia).toContain("impermeabilizante");
  });
});

describe("búsqueda por la descripción de Saint", () => {
  const base = { marca: "COLLET", imagen: null, categoriaSlug: "pinturas", subcategoria: "Pinturas" };
  const catalogo = [
    { ...base, id: "COLLET005", nombre: "COLLET DECO PLUS PINTURA 1/4 GAL", descripcion: "AMARILLO PRIMAVERA", precio: 9 },
    { ...base, id: "COLLET021", nombre: "COLLET DECO PLUS PINTURA 1/4 GAL", descripcion: "AZUL INTENSIDAD", precio: 9 },
    { ...base, id: "ACS0082", nombre: "ACESA LLAVE COMBINADA PROFESIONAL 11 mm", descripcion: "01-755P-M-11", marca: "ACESA", categoriaSlug: "herramientas", subcategoria: "Llaves", precio: 8 },
  ];
  const indiceDescripcion = crearIndice(catalogo);

  it('"azul" encuentra la pintura de ese color, no las demás', () => {
    const ids = buscar(indiceDescripcion, "pintura azul").productos.map((p) => p.id);
    expect(ids[0]).toBe("COLLET021");
    expect(ids).not.toContain("ACS0082");
  });

  it("una referencia del fabricante encuentra su producto", () => {
    expect(buscar(indiceDescripcion, "01-755P-M-11").productos.map((p) => p.id)).toContain("ACS0082");
  });
});

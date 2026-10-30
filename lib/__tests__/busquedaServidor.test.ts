import { describe, expect, it } from "vitest";
import { muestraSaint } from "@/lib/__tests__/datos/muestraSaint";
import { crearIndice } from "@/lib/recomendaciones/busqueda";
import type { Senal } from "@/lib/recomendaciones/tipos";
import {
  elegirFavoritos,
  LARGO_MAXIMO_CONSULTA,
  leerIds,
  leerSenales,
  limpiarConsulta,
  MAXIMO_SENALES,
  responderInteresar,
  responderSugerencias,
} from "../busquedaServidor";
import { repartirPorCategoria } from "../repartirSaint";

const indice = crearIndice(muestraSaint);
const MARTILLO = "BLLT0084"; // BELLOTA MARTILLO 8001-D BASIC (real de Saint)
const TALADRO = "BSC0165"; // BOSCH TALADRO 1/2" PERCUTOR (real de Saint)

describe("/api/sugerencias (responderSugerencias + limpiarConsulta)", () => {
  it("limpia la consulta: espacios de más, no-texto y largo máximo", () => {
    expect(limpiarConsulta("  llave   combinada  11 ")).toBe("llave combinada 11");
    expect(limpiarConsulta(null)).toBe("");
    expect(limpiarConsulta(["martillo"])).toBe("");
    expect(limpiarConsulta("a".repeat(500))).toHaveLength(LARGO_MAXIMO_CONSULTA);
  });

  it("vacío o de una letra: no busca", () => {
    expect(responderSugerencias(indice, "")).toEqual({ productos: [], correccion: null, listo: true });
    expect(responderSugerencias(indice, "m")).toEqual({ productos: [], correccion: null, listo: true });
  });

  it("índice no listo: vacío y listo: false, sin esperar", () => {
    expect(responderSugerencias(null, "martillo")).toEqual({ productos: [], correccion: null, listo: false });
  });

  it("encuentra y manda solo los campos de la fila de sugerencia", () => {
    const { productos, correccion, listo } = responderSugerencias(indice, "martillo");
    expect(listo).toBe(true);
    expect(correccion).toBeNull();
    expect(productos.map((p) => p.id)).toContain(MARTILLO);
    expect(Object.keys(productos[0]).sort()).toEqual(
      ["categoriaSlug", "descripcion", "id", "imagen", "marca", "nombre", "precio", "subcategoria", "titulo"].sort(),
    );
    expect(productos.length).toBeLessThanOrEqual(6);
  });

  it('corrige errores: "martiyo" → martillo', () => {
    const { productos, correccion } = responderSugerencias(indice, "martiyo");
    expect(correccion).toBe("martillo");
    expect(productos.map((p) => p.id)).toContain(MARTILLO);
  });

  it("una consulta larguísima (ya recortada) responde sin romperse", () => {
    const { listo } = responderSugerencias(indice, limpiarConsulta("tornillo ".repeat(100)));
    expect(listo).toBe(true);
  });
});

describe("/api/favoritos (leerIds + elegirFavoritos)", () => {
  it("lee solo códigos válidos, sin repetir y como mucho el máximo", () => {
    expect(leerIds(["A", " A ", "", 3, null, "x".repeat(65), "B"], 10)).toEqual(["A", "B"]);
    expect(leerIds("A,B", 10)).toEqual([]);
    expect(leerIds(Array.from({ length: 300 }, (_, i) => `P${i}`), 200)).toHaveLength(200);
  });

  it("devuelve esos productos en el mismo orden y deja fuera los que no están", () => {
    const productos = elegirFavoritos(muestraSaint, [TALADRO, "NO-EXISTE", MARTILLO]);
    expect(productos.map((p) => p.id)).toEqual([TALADRO, MARTILLO]);
    // La descripción de Saint sí viaja (es corta y distingue productos con el mismo nombre); lo demás, no.
    expect(Object.keys(productos[0]).sort()).toEqual(
      ["categoriaSlug", "descripcion", "id", "imagen", "marca", "nombre", "precio", "subcategoria", "titulo", "ventas"].sort(),
    );
  });
});

describe("/api/te-puede-interesar (leerSenales + responderInteresar)", () => {
  const ahora = Date.now();
  const senal = (s: Partial<Senal>, minutos: number): Senal => ({ tipo: "visto", fecha: ahora - minutos * 60_000, ...s }) as Senal;

  it("descarta señales mal formadas y se queda con las más recientes", () => {
    const muchas = Array.from({ length: 80 }, (_, i) => senal({ id: `P${i}` }, i));
    const leidas = leerSenales([...muchas, { tipo: "inventado", id: "X", fecha: ahora }, { tipo: "visto", fecha: "ayer" }, null]);
    expect(leidas).toHaveLength(MAXIMO_SENALES);
    expect(leidas[0].id).toBe("P0"); // la más reciente primero
    expect(leerSenales("no es una lista")).toEqual([]);
  });

  it("sin índice listo: null (el navegador se queda con los más vendidos)", () => {
    expect(responderInteresar(null, [senal({ id: MARTILLO }, 1)], [])).toBeNull();
  });

  it("con lo que el cliente miró: hasta 10 productos, sin lo que ya tiene en el carrito", () => {
    const senales = [senal({ tipo: "carrito", id: TALADRO }, 5), senal({ id: MARTILLO }, 2), senal({ tipo: "busqueda", termino: "broca" }, 1)];
    const productos = responderInteresar(indice, senales, [TALADRO])!;
    expect(productos.length).toBeGreaterThan(0);
    expect(productos.length).toBeLessThanOrEqual(10);
    expect(productos.map((p) => p.id)).not.toContain(TALADRO);
  });
});

describe("Saint con varias categorías (repartirPorCategoria)", () => {
  const respuesta = {
    tasa: 888.12,
    categoria: [1171, 1200],
    subcategorias: [
      { codigo: 1172, nombre: "MANUALES", codCategoria: 1171, cantidad: 2 },
      { codigo: 1201, nombre: "TUBERIAS", codCategoria: 1200, cantidad: 1 },
    ],
    productos: [
      { codigo: "A1", nombre: "MARTILLO", codCategoria: 1171, codSubcategoria: 1172 },
      { codigo: "A2", nombre: "SEGUETA", codCategoria: "1171", codSubcategoria: 1172 },
      { codigo: "B1", nombre: "TUBO PVC", codCategoria: 1200, codSubcategoria: 1201 },
      { codigo: "Z1", nombre: "DE OTRA CATEGORIA", codCategoria: 9999 },
    ],
  };

  it("reparte productos y subcategorías por codCategoria y descarta los que no están en el mapa", () => {
    const partes = repartirPorCategoria(respuesta, { herramientas: 1171, griferia: 1200, pinturas: 1300 });
    expect(partes.get("herramientas")!.productos.map((p) => (p as { codigo: string }).codigo)).toEqual(["A1", "A2"]);
    expect(partes.get("griferia")!.productos).toHaveLength(1);
    expect(partes.get("griferia")!.subcategorias).toHaveLength(1);
    expect(partes.get("pinturas")!.productos).toEqual([]); // en el mapa pero sin productos: lista vacía
    expect(partes.get("herramientas")!.tasa).toBe(888.12);
  });

  it("con una sola categoría en el mapa, todo va a esa aunque falte codCategoria (API de antes)", () => {
    const vieja = { tasa: 1, productos: [{ codigo: "A1" }, { codigo: "A2" }], subcategorias: [{ codigo: 1, nombre: "X" }] };
    const partes = repartirPorCategoria(vieja, { herramientas: 1171 });
    expect(partes.get("herramientas")!.productos).toHaveLength(2);
    expect(partes.get("herramientas")!.subcategorias).toHaveLength(1);
  });

  it("sin lista de productos: la deja pasar tal cual para que convertir() la rechace", () => {
    const partes = repartirPorCategoria({ error: "Falta la categoria" }, { herramientas: 1171 });
    expect(Array.isArray(partes.get("herramientas")!.productos)).toBe(false);
  });
});

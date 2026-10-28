import { describe, expect, it } from "vitest";
import { muestraSaint as productosMock } from "@/lib/__tests__/datos/muestraSaint";
import { barrasParaTramos } from "../cabillas";
import { caratoKgPorM2 } from "../ceramica";
import { MATERIALES, type IdMaterial } from "../materiales";
import { repartirEnCunetes } from "../pintura";
import { CALCULADORAS, medidasCompletas, obtenerCalculadora, opcionesIniciales } from "../registro";
import type { Entrada, Resultado } from "../tipos";
import { haciaArriba, numero } from "../util";

// Cada caso está resuelto a mano, paso a paso, en docs/FORMULAS.md.

function calcular(slug: string, medidas: Entrada["medidas"], opciones: Entrada["opciones"] = {}): Resultado {
  const calculadora = obtenerCalculadora(slug)!;
  return calculadora.calcular({ medidas, opciones: { ...opcionesIniciales(calculadora), ...opciones } });
}

/** Cantidades del resultado como { material: cantidad }, para comparar de un vistazo. */
function cantidades(r: Resultado): Record<string, number> {
  return Object.fromEntries(r.materiales.map((m) => [m.material, m.cantidad]));
}

describe("bloques para paredes", () => {
  it("pared de 5 × 2,5 m con 2 m² de vanos, arcilla de 15 cm", () => {
    // 10,5 m² × 14,77 bloques/m² × 1,05 = 162,8 → 163; mortero 0,198 m³ → 1,69 sacos y 0,23 m³ de arena
    expect(cantidades(calcular("bloques", { largo: 5, alto: 2.5, vanos: 2 }))).toEqual({
      "bloque-arcilla-15": 163,
      cemento: 2,
      arena: 1,
    });
  });

  it("cerca de 10 × 3 m en bloque de concreto de 20 cm", () => {
    // 30 m² × 12,04 × 1,05 = 379,4 → 380; mortero 0,709 m³ → 6,08 sacos y 0,82 m³ de arena
    expect(cantidades(calcular("bloques", { largo: 10, alto: 3 }, { tipo: "concreto", espesor: "20" }))).toEqual({
      "bloque-concreto-20": 380,
      cemento: 7,
      arena: 1,
    });
  });
});

describe("concreto para vaciados", () => {
  it("losa de 4 × 3 m y 10 cm, 210 kg/cm²", () => {
    // 1,2 m³ × 1,05 = 1,26 m³ → 12,26 sacos, 0,66 m³ de arena, 0,67 m³ de piedra, 234 L de agua
    const r = calcular("concreto", { largo: 4, ancho: 3, espesor: 10, cantidad: 1 });
    expect(cantidades(r)).toEqual({ cemento: 13, arena: 1, piedra: 1 });
    expect(r.datos.find((d) => d.etiqueta === "Agua aproximada")?.valor).toBe("234 litros");
  });

  it("4 columnas de 30 × 30 cm y 2,7 m de alto", () => {
    // 2,7 × 0,3 × 0,3 × 4 = 0,972 m³ × 1,05 = 1,021 m³ → 9,93 sacos
    const r = calcular("concreto", { largo: 2.7, ancho: 0.3, espesor: 30, cantidad: 4 }, { elemento: "columna" });
    expect(cantidades(r)).toEqual({ cemento: 10, arena: 1, piedra: 1 });
  });

  it("a más resistencia, más cemento", () => {
    const medidas = { largo: 6, ancho: 5, espesor: 12, cantidad: 1 };
    const sacos = ["140", "175", "210", "245", "280"].map((resistencia) => cantidades(calcular("concreto", medidas, { resistencia })).cemento);
    expect(sacos).toEqual([...sacos].sort((a, b) => a - b));
    expect(new Set(sacos).size).toBe(5);
  });
});

describe("friso", () => {
  it("10,5 m² a 1,5 cm con mezcla 1:4", () => {
    // 10,5 × 0,015 × 1,10 = 0,173 m³ → 1,48 sacos y 0,20 m³ de arena
    expect(cantidades(calcular("friso", { largo: 5, alto: 2.5, vanos: 2, espesor: 1.5 }))).toEqual({ cemento: 2, arena: 1 });
  });

  it("100 m² a 2 cm con mezcla 1:3", () => {
    // 100 × 0,02 × 1,10 = 2,2 m³ → 23,5 sacos y 2,40 m³ de arena
    expect(cantidades(calcular("friso", { largo: 40, alto: 2.5, espesor: 2 }, { mezcla: "1:3" }))).toEqual({ cemento: 24, arena: 3 });
  });
});

describe("cabillas", () => {
  it("corta varias piezas de una barra cuando caben", () => {
    expect(barrasParaTramos(21, 3, 0.38)).toEqual({ barras: 11, metros: 63 }); // 2 piezas de 3 m por barra
    expect(barrasParaTramos(16, 4, 0.38)).toEqual({ barras: 16, metros: 64 }); // 1 pieza de 4 m por barra
  });

  it("empalma con solape cuando el tramo es más largo que la barra", () => {
    // 8 m con solape de 0,508 m: 1 barra entera + un pedazo de 2,508 m (salen 2 por barra)
    const r = barrasParaTramos(35, 8, 0.508);
    expect(r.barras).toBe(53);
    expect(r.metros).toBeCloseTo(297.78, 2);
  });

  it('losa de 4 × 3 m, 3/8" cada 20 cm', () => {
    // 16 tramos de 4 m (16 barras) + 21 de 3 m (11 barras) = 27; 127 m × 0,559 = 71 kg → 1,77 kg de alambre
    expect(cantidades(calcular("cabillas", { largo: 4, ancho: 3, separacion: 20 }))).toEqual({ "cabilla-3/8": 27, alambre: 2 });
  });

  it('losa de 8 × 5 m, 1/2" cada 15 cm', () => {
    // 35 tramos de 8 m (53 barras) + 55 de 5 m (55 barras) = 108; 572,78 m × 0,994 = 569 kg → 14,2 kg de alambre
    expect(cantidades(calcular("cabillas", { largo: 8, ancho: 5, separacion: 15 }, { diametro: "1/2" }))).toEqual({
      "cabilla-1/2": 108,
      alambre: 15,
    });
  });

  it("la malla doble duplica los tramos (y aprovecha los sobrantes)", () => {
    // 32 tramos de 4 m (32 barras) + 42 de 3 m (21 barras) = 53: una menos que 2 × 27, porque ya no sobra media barra
    expect(cantidades(calcular("cabillas", { largo: 4, ancho: 3, separacion: 20 }, { capas: "2" }))["cabilla-3/8"]).toBe(53);
  });
});

describe("pintura", () => {
  it("reparte los galones en cuñetes y sueltos", () => {
    expect(repartirEnCunetes(2)).toEqual({ cunetes: 0, sueltos: 2 });
    expect(repartirEnCunetes(3)).toEqual({ cunetes: 1, sueltos: 0 }); // 3 sueltos: conviene el cuñete
    expect(repartirEnCunetes(5)).toEqual({ cunetes: 1, sueltos: 1 });
    expect(repartirEnCunetes(11)).toEqual({ cunetes: 3, sueltos: 0 });
  });

  it("27 m² de pared nueva lisa, 2 manos", () => {
    // 27 × 2 ÷ 40 × 1,05 = 1,42 → 2 galones; sellador 27 ÷ 35 × 1,05 = 0,81 → 1
    expect(cantidades(calcular("pintura", { largo: 12, alto: 2.5, vanos: 3 }, { sellador: "si" }))).toEqual({
      "pintura-galon": 2,
      sellador: 1,
    });
  });

  it("80 m² lisos, 2 manos: un cuñete y un galón", () => {
    // 80 × 2 ÷ 40 × 1,05 = 4,2 → 5 galones
    expect(cantidades(calcular("pintura", { largo: 32, alto: 2.5 }))).toEqual({ "pintura-cunete": 1, "pintura-galon": 1 });
  });

  it("150 m² rugosos, 2 manos: tres cuñetes", () => {
    // 150 × 2 ÷ 30 × 1,05 = 10,5 → 11 galones = 2 cuñetes + 3 sueltos → 3 cuñetes
    expect(cantidades(calcular("pintura", { largo: 60, alto: 2.5 }, { superficie: "rugosa" }))).toEqual({ "pintura-cunete": 3 });
  });
});

describe("cerámica y porcelanato", () => {
  it("fórmula del carato", () => {
    expect(caratoKgPorM2(450, 8, 3)).toBeCloseTo(0.1707, 4); // cerámica 45 × 45, junta de 3 mm
    expect(caratoKgPorM2(600, 9, 2)).toBeCloseTo(0.096, 4); // porcelanato 60 × 60, junta de 2 mm
  });

  it("piso de 4 × 3,5 m en cerámica recta", () => {
    // 14 × 1,10 ÷ 2,03 = 7,59 → 8 cajas; pego 73,5 kg → 8 sacos; carato 2,63 kg → 2 bolsas
    expect(cantidades(calcular("ceramica", { largo: 4, ancho: 3.5 }))).toEqual({ ceramica: 8, pego: 8, carato: 2 });
  });

  it("piso de 5 × 4 m en porcelanato diagonal", () => {
    // 20 × 1,15 ÷ 1,44 = 15,97 → 16 cajas; pego 126 kg → 13 sacos; carato 2,11 kg → 2 bolsas
    expect(cantidades(calcular("ceramica", { largo: 5, ancho: 4 }, { tipo: "porcelanato", colocacion: "diagonal" }))).toEqual({
      porcelanato: 16,
      pego: 13,
      carato: 2,
    });
  });
});

describe("contrapiso", () => {
  it("5 × 4 m a 8 cm en concreto de 140", () => {
    // 1,6 m³ × 1,05 = 1,68 m³ → 11,78 sacos, 0,94 m³ de arena, 0,96 m³ de piedra
    expect(cantidades(calcular("contrapiso", { largo: 5, ancho: 4, espesor: 8 }))).toEqual({ cemento: 12, arena: 1, piedra: 1 });
  });

  it("sobrepiso de mortero de 5 × 4 m a 4 cm (sin piedra)", () => {
    // 0,8 m³ × 1,10 = 0,88 m³ → 7,54 sacos y 1,02 m³ de arena
    expect(cantidades(calcular("contrapiso", { largo: 5, ancho: 4, espesor: 4 }, { tipo: "mortero" }))).toEqual({ cemento: 8, arena: 2 });
  });
});

describe("techo con láminas", () => {
  it("un agua de 6 m de largo y 3,5 m de caída, en zinc", () => {
    // ⌈6 ÷ 0,70⌉ = 9 hileras × 1 = 9 → 9,45 → 10 láminas; 21 m² × 6 × 1,05 = 132 tornillos → 2 bolsas
    expect(cantidades(calcular("techo", { largo: 6, caida: 3.5 }))).toEqual({ "lamina-zinc": 10, "tornillo-techo": 2 });
  });

  it("dos aguas de 10 m de largo y 5 m de caída, en acerolit", () => {
    // ⌈10 ÷ 0,76⌉ = 14 hileras × 2 por hilera × 2 aguas = 56 → 58,8 → 59; 100 m² → 630 tornillos → 7 bolsas
    expect(cantidades(calcular("techo", { largo: 10, caida: 5 }, { lamina: "acerolit", aguas: "2" }))).toEqual({
      "lamina-acerolit": 59,
      "tornillo-techo": 7,
    });
  });
});

describe("impermeabilización", () => {
  it("platabanda de 8 × 6 m con manto asfáltico", () => {
    // 48 × 1,10 = 52,8 m² ÷ 9 = 5,87 → 6 rollos; ÷ 12 = 4,4 → 5 galones de primer
    expect(cantidades(calcular("impermeabilizacion", { largo: 8, ancho: 6 }))).toEqual({ manto: 6, "primer-asfaltico": 5 });
  });

  it("platabanda de 8 × 6 m con acrílico", () => {
    // 52,8 m² × 1 L/m² ÷ 18,9 L = 2,79 → 3 cuñetes
    expect(cantidades(calcular("impermeabilizacion", { largo: 8, ancho: 6 }, { sistema: "acrilico" }))).toEqual({
      "impermeabilizante-acrilico": 3,
    });
  });
});

describe("drywall", () => {
  it("pared divisoria de 5 × 2,5 m, parales cada 61 cm", () => {
    // 25 m² de lámina → 9,24 → 10 láminas; 10 parales; 3,44 → 4 rieles; 300 tornillos; 37,5 m de cinta; 17,5 kg de masilla
    expect(cantidades(calcular("drywall", { largo: 5, alto: 2.5 }))).toEqual({
      "lamina-drywall": 10,
      paral: 10,
      riel: 4,
      "tornillo-drywall": 3,
      "cinta-juntas": 1,
      masilla: 4,
    });
  });

  it("revestimiento de 6 × 3,2 m con una puerta, parales cada 40,6 cm", () => {
    // 17,3 m² → 6,39 → 7 láminas; 16 líneas × 2 piezas (3,2 m > 3,05 m) = 32 parales; 4,13 → 5 rieles
    expect(cantidades(calcular("drywall", { largo: 6, alto: 3.2, vanos: 1.9 }, { caras: "1", separacion: "40" }))).toEqual({
      "lamina-drywall": 7,
      paral: 32,
      riel: 5,
      "tornillo-drywall": 3,
      "cinta-juntas": 1,
      masilla: 3,
    });
  });
});

describe("todas las calculadoras", () => {
  it("son 10, con slug único", () => {
    expect(CALCULADORAS).toHaveLength(10);
    expect(new Set(CALCULADORAS.map((c) => c.slug)).size).toBe(10);
  });

  it("redondean siempre hacia arriba a unidades enteras", () => {
    expect(haciaArriba(1.0000000001)).toBe(1);
    expect(haciaArriba(1.01)).toBe(2);
    expect(haciaArriba(0)).toBe(0);
    for (const c of CALCULADORAS) {
      const medidas = Object.fromEntries(c.campos.map((campo) => [campo.id, campo.defecto ?? 3.7]));
      for (const linea of c.calcular({ medidas, opciones: opcionesIniciales(c) }).materiales) {
        expect(Number.isInteger(linea.cantidad), `${c.slug} · ${linea.material}`).toBe(true);
        expect(linea.cantidad).toBeGreaterThan(0);
      }
    }
  });

  it("con cada combinación de opciones solo devuelven materiales que declaran", () => {
    for (const c of CALCULADORAS) {
      const medidas = Object.fromEntries(c.campos.map((campo) => [campo.id, campo.defecto ?? 4.2]));
      const combinaciones = c.grupos.reduce<Entrada["opciones"][]>(
        (acumulado, grupo) => acumulado.flatMap((o) => grupo.opciones.map((opcion) => ({ ...o, [grupo.id]: opcion.valor }))),
        [{}],
      );
      for (const opciones of combinaciones) {
        const r = c.calcular({ medidas, opciones });
        expect(r.materiales.length, `${c.slug} ${JSON.stringify(opciones)}`).toBeGreaterThan(0);
        for (const linea of r.materiales) {
          expect(c.materiales, `${c.slug} · ${linea.material}`).toContain(linea.material);
          expect(Number.isFinite(linea.cantidad)).toBe(true);
        }
      }
    }
  });

  it("sin medidas no dan números raros (NaN o negativos)", () => {
    for (const c of CALCULADORAS) {
      expect(medidasCompletas(c, {})).toBe(false);
      for (const linea of c.calcular({ medidas: {}, opciones: opcionesIniciales(c) }).materiales) {
        expect(linea.cantidad).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("todo material y herramienta apunta a un producto que existe en el catálogo de prueba", () => {
    const codigos = new Set(productosMock.map((p) => p.id));
    const usados = new Set<IdMaterial>(CALCULADORAS.flatMap((c) => [...c.materiales, ...c.herramientas]));
    for (const id of usados) {
      const { productoId } = MATERIALES[id];
      expect(productoId === null || codigos.has(productoId), `${id} → ${productoId}`).toBe(true);
    }
  });

  it("escriben los números en formato venezolano", () => {
    expect(numero(1234.5)).toBe("1.234,5");
    expect(numero(0.198, 3)).toBe("0,198");
  });
});

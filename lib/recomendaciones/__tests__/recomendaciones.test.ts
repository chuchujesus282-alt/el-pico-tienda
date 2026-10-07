import { describe, expect, it } from "vitest";
import { productosMock } from "@/lib/mock/productos";
import { crearIndice } from "../busqueda";
import { tePuedeInteresar } from "../interesar";
import { agregarSenal, pesoSenal, senalesDesdeCompras, validarSenales } from "../perfil";
import { masVendidos } from "../productos";
import { compradosJuntos, relacionados } from "../relacionados";
import type { Senal } from "../tipos";

const producto = (id: string) => productosMock.find((p) => p.id === id)!;
const CEMENTO = "00605004";
const PINTURA = "00504010";
const TORNILLO_1_4 = "00706102";
const DIA = 24 * 60 * 60 * 1000;
const AHORA = Date.UTC(2026, 9, 7);

describe("productos relacionados", () => {
  it("los del cemento incluyen llana o pala", () => {
    const r = relacionados(producto(CEMENTO), productosMock);
    expect(r.some((p) => /^(LLANA|PALA)/.test(p.nombre))).toBe(true);
  });

  it("entre 4 y 8, sin repetir el actual", () => {
    for (const p of productosMock) {
      const r = relacionados(p, productosMock);
      expect(r.length, p.nombre).toBeGreaterThanOrEqual(4);
      expect(r.length, p.nombre).toBeLessThanOrEqual(8);
      expect(r.map((x) => x.id)).not.toContain(p.id);
      expect(new Set(r.map((x) => x.id)).size).toBe(r.length);
    }
  });

  it("los del tornillo de 1/4 traen ramplug, broca y destornillador (y prefieren la misma medida)", () => {
    const r = relacionados(producto(TORNILLO_1_4), productosMock);
    const nombres = r.map((p) => p.nombre);
    expect(nombres.some((n) => /^(RAMPLUG|TARUGO)/.test(n))).toBe(true);
    expect(nombres).toContain('BROCA PARA CONCRETO 1/4" X 4"');
    expect(nombres.some((n) => /DESTORNILLADOR/.test(n))).toBe(true);
  });

  it("usa 'comprados juntos' cuando hay facturas", () => {
    const facturas = [
      [CEMENTO, "00605041"],
      [CEMENTO, "00605041", "00605066"],
      [CEMENTO, "00605041"],
      ["00605041"],
      [PINTURA, "00504072"],
    ];
    const juntos = compradosJuntos(CEMENTO, facturas);
    expect(juntos[0].id).toBe("00605041");
    const r = relacionados(producto(CEMENTO), productosMock, { juntos });
    expect(r[0].id).toBe("00605041");
  });
});

describe("perfil", () => {
  it("las señales pierden la mitad del peso cada 30 días", () => {
    const s: Senal = { tipo: "whatsapp", id: PINTURA, fecha: AHORA - 30 * DIA };
    expect(pesoSenal(s, AHORA)).toBeCloseTo(4); // 8 / 2
  });

  it("no repite la misma señal en media hora y descarta datos corruptos", () => {
    const s: Senal = { tipo: "visto", id: CEMENTO, fecha: AHORA };
    expect(agregarSenal(agregarSenal([], s), { ...s, fecha: AHORA + 60_000 })).toHaveLength(1);
    expect(validarSenales([{ tipo: "visto" }, null, "x", s, { tipo: "otro", id: "1", fecha: 1 }])).toEqual([s]);
  });

  it("el historial de compras del SQL se convierte en señales", () => {
    expect(senalesDesdeCompras([{ productoId: CEMENTO, fecha: "2026-10-01" }])[0]).toMatchObject({ tipo: "compra", id: CEMENTO });
  });
});

describe("te puede interesar", () => {
  it("usuario nuevo: los más vendidos", () => {
    expect(tePuedeInteresar({ productos: productosMock, senales: [], limite: 6 })).toEqual(masVendidos(productosMock, 6));
  });

  it("quien envió pintura a WhatsApp ve brochas o rodillos", () => {
    const senales: Senal[] = [{ tipo: "whatsapp", id: PINTURA, fecha: AHORA - DIA }];
    const r = tePuedeInteresar({ productos: productosMock, senales, ahora: AHORA, limite: 6 });
    expect(r.slice(0, 4).some((p) => /^(BROCHA|RODILLO)/.test(p.nombre))).toBe(true);
  });

  it("no sugiere lo que está en el carrito, salvo consumibles", () => {
    const RODILLO = "00504058";
    const CINTA_PAPEL = "00504131";
    const senales: Senal[] = [{ tipo: "whatsapp", id: PINTURA, fecha: AHORA }];
    const r = tePuedeInteresar({ productos: productosMock, senales, enCarrito: [RODILLO, CINTA_PAPEL], ahora: AHORA });
    expect(r.map((p) => p.id)).not.toContain(RODILLO);
    expect(r.map((p) => p.id)).toContain(CINTA_PAPEL); // la cinta se gasta: se puede volver a sugerir
  });

  it("las búsquedas también cuentan", () => {
    const senales: Senal[] = [{ tipo: "busqueda", termino: "teipe", fecha: AHORA }];
    const r = tePuedeInteresar({ productos: productosMock, senales, indice: crearIndice(productosMock), ahora: AHORA });
    expect(r[0].nombre).toMatch(/^CINTA AISLANTE/);
  });
});

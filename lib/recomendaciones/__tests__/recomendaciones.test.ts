import { describe, expect, it } from "vitest";
import { muestraSaint } from "@/lib/__tests__/datos/muestraSaint";
import { crearIndice } from "../busqueda";
import { tePuedeInteresar } from "../interesar";
import { agregarSenal, pesoSenal, senalesDesdeCompras, validarSenales } from "../perfil";
import { masVendidos } from "../productos";
import { compradosJuntos, relacionados } from "../relacionados";
import type { Senal } from "../tipos";

// Sobre productos REALES de Saint (lib/__tests__/datos/muestraSaint.ts). Se buscan por su nombre de Saint.
const buscarNombre = (patron: RegExp) => {
  const p = muestraSaint.find((x) => patron.test(x.nombre));
  if (!p) throw new Error(`La muestra no tiene ${patron}`);
  return p;
};
const CEMENTO = buscarNombre(/^MORTERO SACO CEMENTO GRIS 42\.5KG/);
const PINTURA = buscarNombre(/^ABC CAUCHO BLANCO GALON/);
const TORNILLO_1_4 = buscarNombre(/^TOR CARRUAJE 1\/4X3\/4/);
const CUCHARA = buscarNombre(/^CUCHARA PARA ALBANIL/);
const CARRETILLA = buscarNombre(/^CARRETILLA CONSTRUCCION GRIS/);
const RODILLO = buscarNombre(/RODILLO/);
const TIRRO = buscarNombre(/^TIRRO PAPEL/);
const DIA = 24 * 60 * 60 * 1000;
const AHORA = Date.UTC(2026, 9, 7);

describe("productos relacionados", () => {
  it("los del cemento incluyen pala o cuchara de albañil", () => {
    const r = relacionados(CEMENTO, muestraSaint);
    expect(r.some((p) => /PALA|CUCHARA|LLANA|PALUSTRA/.test(p.nombre))).toBe(true);
  });

  it("entre 4 y 8, sin repetir el actual", () => {
    for (const p of muestraSaint) {
      const r = relacionados(p, muestraSaint);
      expect(r.length, p.nombre).toBeGreaterThanOrEqual(4);
      expect(r.length, p.nombre).toBeLessThanOrEqual(8);
      expect(r.map((x) => x.id)).not.toContain(p.id);
      expect(new Set(r.map((x) => x.id)).size).toBe(r.length);
    }
  });

  it('los de un tornillo de 1/4 ("TOR …" en Saint) traen ramplug, mecha y destornillador', () => {
    const nombres = relacionados(TORNILLO_1_4, muestraSaint).map((p) => p.nombre);
    expect(nombres.some((n) => /RAMPLUG|TARUGO/.test(n))).toBe(true);
    expect(nombres.some((n) => /MECHA|BROCA/.test(n))).toBe(true);
    expect(nombres.some((n) => /DESTORNILLADOR/.test(n))).toBe(true);
  });

  it("usa 'comprados juntos' cuando hay facturas", () => {
    const facturas = [
      [CEMENTO.id, CUCHARA.id],
      [CEMENTO.id, CUCHARA.id, CARRETILLA.id],
      [CEMENTO.id, CUCHARA.id],
      [CUCHARA.id],
      [PINTURA.id, RODILLO.id],
    ];
    const juntos = compradosJuntos(CEMENTO.id, facturas);
    expect(juntos[0].id).toBe(CUCHARA.id);
    const r = relacionados(CEMENTO, muestraSaint, { juntos });
    expect(r[0].id).toBe(CUCHARA.id);
  });
});

describe("perfil", () => {
  it("las señales pierden la mitad del peso cada 30 días", () => {
    const s: Senal = { tipo: "whatsapp", id: PINTURA.id, fecha: AHORA - 30 * DIA };
    expect(pesoSenal(s, AHORA)).toBeCloseTo(4); // 8 / 2
  });

  it("no repite la misma señal en media hora y descarta datos corruptos", () => {
    const s: Senal = { tipo: "visto", id: CEMENTO.id, fecha: AHORA };
    expect(agregarSenal(agregarSenal([], s), { ...s, fecha: AHORA + 60_000 })).toHaveLength(1);
    expect(validarSenales([{ tipo: "visto" }, null, "x", s, { tipo: "otro", id: "1", fecha: 1 }])).toEqual([s]);
  });

  it("el historial de compras del SQL se convierte en señales", () => {
    expect(senalesDesdeCompras([{ productoId: CEMENTO.id, fecha: "2026-10-01" }])[0]).toMatchObject({ tipo: "compra", id: CEMENTO.id });
  });
});

describe("te puede interesar", () => {
  it("usuario nuevo: los más vendidos", () => {
    expect(tePuedeInteresar({ productos: muestraSaint, senales: [], limite: 6 })).toEqual(masVendidos(muestraSaint, 6));
  });

  it("quien envió una pintura a WhatsApp ve otras pinturas parecidas", () => {
    const senales: Senal[] = [{ tipo: "whatsapp", id: PINTURA.id, fecha: AHORA - DIA }];
    const r = tePuedeInteresar({ productos: muestraSaint, senales, ahora: AHORA, limite: 6 });
    expect(r.slice(0, 4).some((p) => p.id !== PINTURA.id && /CAUCHO|PINTURA/.test(p.nombre))).toBe(true);
  });

  it("no sugiere lo que está en el carrito, salvo consumibles", () => {
    const senales: Senal[] = [
      { tipo: "visto", id: RODILLO.id, fecha: AHORA },
      { tipo: "visto", id: TIRRO.id, fecha: AHORA },
    ];
    const r = tePuedeInteresar({ productos: muestraSaint, senales, enCarrito: [RODILLO.id, TIRRO.id], ahora: AHORA });
    expect(r.map((p) => p.id)).not.toContain(RODILLO.id);
    expect(r.map((p) => p.id)).toContain(TIRRO.id); // el tirro se gasta: se puede volver a sugerir
  });

  it("las búsquedas también cuentan", () => {
    const senales: Senal[] = [{ tipo: "busqueda", termino: "teipe", fecha: AHORA }];
    const r = tePuedeInteresar({ productos: muestraSaint, senales, indice: crearIndice(muestraSaint), ahora: AHORA });
    expect(r.slice(0, 5).some((p) => /TEIPE|CINTA AISLANTE/.test(p.nombre))).toBe(true);
  });
});

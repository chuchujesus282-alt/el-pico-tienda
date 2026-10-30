import { describe, expect, it } from "vitest";
import { calcularPedido, limpiarEnvioPedido } from "@/lib/pedidos/reglas";
import { distanciaMetros, limpiarDirecciones, mezclarDirecciones } from "@/lib/mezclaCuenta";
import { limpiarEnvio, limpiarEvento } from "@/lib/eventos/reglas";
import type { Producto } from "@/types/catalogo";

const ID = "5f0c1d2e-3a4b-4c5d-8e6f-7a8b9c0d1e2f";
const base = {
  id: ID,
  items: [
    { id: "ACS0082", nombre: "ACESA LLAVE COMBINADA PROFESIONAL 11 mm", cantidad: 2, precio: 7.5 },
    { id: "BRUF0525", nombre: "BRUFER CINTA METRICA 5MTS X 19MM", cantidad: 1, precio: 3.93 },
  ],
  retiro: "delivery",
  direccion: { nombre: "Casa", descripcion: "Edificio Ávila, piso 3", latitud: 10.49, longitud: -66.88 },
  pago: "divisas",
  combinados: [],
};

const producto = (id: string, precio: number): Producto => ({
  id,
  nombre: id,
  marca: null,
  precio,
  imagen: null,
  categoriaSlug: "herramientas",
  subcategoria: null,
});

describe("limpiarEnvioPedido", () => {
  it("acepta un pedido bien formado", () => {
    const limpio = limpiarEnvioPedido(base);
    expect(limpio?.items).toHaveLength(2);
    expect(limpio?.direccion?.nombre).toBe("Casa");
  });

  it("rechaza lo que no sirve", () => {
    for (const malo of [
      null,
      { ...base, id: "no-es-uuid" },
      { ...base, items: [] },
      { ...base, items: [{ id: "<b>", cantidad: 1, precio: 1 }] },
      { ...base, retiro: "avion" },
      { ...base, pago: "bitcoin" },
      { ...base, pago: "combinado", combinados: ["divisas"] }, // combinado pide al menos dos
    ]) {
      expect(limpiarEnvioPedido(malo)).toBeNull();
    }
  });

  it("limpia cantidades, repetidos, combinados y la dirección", () => {
    const limpio = limpiarEnvioPedido({
      ...base,
      items: [
        { id: "A1", nombre: "X", cantidad: 2.7, precio: 1 },
        { id: "A1", nombre: "X", cantidad: 1, precio: 1 }, // repetido
        { id: "A2", nombre: "Y", cantidad: 0, precio: 1 }, // cantidad inválida
        { id: "A3", nombre: "Z", cantidad: 1, precio: -5 }, // precio inválido
      ],
      retiro: "pickup",
      pago: "combinado",
      combinados: ["divisas", "zelle", "zelle", "combinado", "otro"],
    });
    expect(limpio?.items).toEqual([{ id: "A1", nombre: "X", descripcion: null, cantidad: 2, precio: 1 }]);
    expect(limpio?.direccion).toBeNull(); // con pick-up no se guarda dirección
    expect(limpio?.combinados).toEqual(["divisas", "zelle"]);
  });
});

describe("calcularPedido", () => {
  it("usa el precio del catálogo y la tasa de ese instante", () => {
    const limpio = limpiarEnvioPedido(base)!;
    const catalogo = new Map([["ACS0082", producto("ACS0082", 7.94)], ["BRUF0525", producto("BRUF0525", 3.93)]]);
    const r = calcularPedido(limpio, catalogo, 887.3);
    expect(r.items[0]).toMatchObject({ precioUsd: 7.94, precioBs: 7045.16, precioVerificado: true });
    expect(r.totalUsd).toBe(19.81);
    expect(r.totalBs).toBe(17577.41);
  });

  it("sin catálogo usa el precio del navegador y lo marca como no verificado; sin tasa, sin Bs", () => {
    const r = calcularPedido(limpiarEnvioPedido(base)!, null, null);
    expect(r.items.every((i) => !i.precioVerificado)).toBe(true);
    expect(r.items[0].precioUsd).toBe(7.5);
    expect(r.totalBs).toBeNull();
    expect(r.items[0].precioBs).toBeNull();
  });
});

describe("direcciones al entrar", () => {
  const casa = { id: "d1", nombre: "Casa", descripcion: "Edificio Ávila, piso 3", latitud: 10.49, longitud: -66.88 };
  const obra = { id: "d2", nombre: "Obra", descripcion: "Galpón 4, zona industrial", latitud: 10.5, longitud: -66.9 };

  it("no duplica: mismo id, o mismo nombre y casi el mismo punto", () => {
    const casaOtroId = { ...casa, id: "d9", nombre: "casa ", latitud: casa.latitud + 0.0001 }; // ~11 m
    expect(distanciaMetros(casa, casaOtroId)).toBeLessThan(25);
    const r = mezclarDirecciones({ lista: [casaOtroId, obra], elegidaId: "d9" }, { lista: [casa], elegidaId: "d1" });
    expect(r.lista.map((d) => d.id)).toEqual(["d1", "d2"]);
    expect(r.elegidaId).toBe("d1"); // la elegida del navegador era la misma casa
  });

  it("mismo nombre pero lejos son dos direcciones; la elegida del navegador manda", () => {
    const casaLejos = { ...casa, id: "d3", latitud: 10.3 };
    const r = mezclarDirecciones({ lista: [casaLejos], elegidaId: "d3" }, { lista: [casa, obra], elegidaId: "d2" });
    expect(r.lista.map((d) => d.id)).toEqual(["d1", "d2", "d3"]);
    expect(r.elegidaId).toBe("d3");
  });

  it("limpia lo inválido y respeta el máximo de 10", () => {
    const muchas = Array.from({ length: 14 }, (_, i) => ({ ...casa, id: `x${i}`, latitud: 10 + i / 100 }));
    const r = limpiarDirecciones({ lista: [...muchas, { id: "mala", nombre: "A", descripcion: "x", latitud: 50, longitud: 0 }], elegidaId: "nada" });
    expect(r.lista).toHaveLength(10);
    expect(r.elegidaId).toBe("x0");
    expect(limpiarDirecciones(null)).toEqual({ lista: [], elegidaId: null });
  });
});

describe("evento pedido_enviado", () => {
  it("lleva el código de pedido y no se repite el mismo producto del mismo pedido", () => {
    expect(limpiarEvento({ tipo: "pedido_enviado", producto: "A1", pedido: ID.toUpperCase() })).toEqual({
      tipo: "pedido_enviado",
      producto: "A1",
      pedido: ID,
    });
    expect(limpiarEvento({ tipo: "pedido_enviado", producto: "A1" })).toBeNull();
    const eventos = [
      { tipo: "pedido_enviado", producto: "A1", pedido: ID },
      { tipo: "pedido_enviado", producto: "A1", pedido: ID },
      { tipo: "pedido_enviado", producto: "A2", pedido: ID },
    ];
    expect(limpiarEnvio({ eventos })).toHaveLength(2);
  });
});

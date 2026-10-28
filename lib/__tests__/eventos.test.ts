import { describe, expect, it } from "vitest";
import {
  claveSinRepetir,
  esRobot,
  LIMITES,
  limpiarEnvio,
  limpiarEvento,
  limpiarTermino,
  pareceDatoPersonal,
  permitidosPorTope,
} from "@/lib/eventos/reglas";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A135M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("esRobot", () => {
  it("deja pasar navegadores de personas (también los de WhatsApp o Instagram)", () => {
    for (const ua of [CHROME, ANDROID, IPHONE, `${ANDROID} Instagram 300.0`, `${ANDROID} WhatsApp/2.24`]) expect(esRobot(ua)).toBe(false);
  });
  it("filtra buscadores, vistas previas, navegadores automáticos y herramientas", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; Google-InspectionTool/1.0)",
      "facebookexternalhit/1.1",
      "TelegramBot (like TwitterBot)",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 11) Chrome-Lighthouse",
      "curl/8.4.0",
      "python-requests/2.31",
      "GPTBot/1.0",
      "",
      null,
    ]) {
      expect(esRobot(ua)).toBe(true);
    }
  });
});

describe("búsquedas con datos personales", () => {
  it("no guarda correos, teléfonos ni cédulas", () => {
    for (const t of ["maria@gmail.com", "0412-1234567", "0414 123 45 67", "+58 412 1234567", "02121234567", "V-12345678", "v 12.345.678", "e-1234567"]) {
      expect(pareceDatoPersonal(t)).toBe(true);
      expect(limpiarTermino(t)).toBeNull();
    }
  });
  it("sí guarda búsquedas de productos, medidas y códigos", () => {
    for (const t of ["llave combinada 11 mm", "ACS0082", "00302011", "tubo pvc 1/2", "cable thw 12", "disco 4 1/2", "6799-05", "v-belt"]) {
      expect(pareceDatoPersonal(t)).toBe(false);
    }
    expect(limpiarTermino("  LLAVE   Combinada  ")).toBe("llave combinada");
    expect(limpiarTermino("x".repeat(100))).toHaveLength(60);
    expect(limpiarTermino("a")).toBeNull();
  });
});

describe("limpiarEvento", () => {
  it("acepta cada tipo solo con sus campos", () => {
    expect(limpiarEvento({ tipo: "producto_visto", producto: "ACS0082", termino: "x", extra: 1 })).toEqual({
      tipo: "producto_visto",
      producto: "ACS0082",
    });
    expect(limpiarEvento({ tipo: "categoria_vista", categoria: "herramientas", subcategoria: "Herramientas eléctricas" })).toEqual({
      tipo: "categoria_vista",
      categoria: "herramientas",
      subcategoria: "Herramientas eléctricas",
    });
    expect(limpiarEvento({ tipo: "categoria_vista", categoria: "griferia" })).toEqual({ tipo: "categoria_vista", categoria: "griferia" });
    expect(limpiarEvento({ tipo: "busqueda", termino: "Taladro", resultados: 5 })).toEqual({ tipo: "busqueda", termino: "taladro", resultados: 5 });
    expect(limpiarEvento({ tipo: "carrito", producto: "00302011" })).toEqual({ tipo: "carrito", producto: "00302011" });
  });
  it("rechaza lo inválido, lo inventado y lo que todavía no se acepta del navegador", () => {
    for (const malo of [
      null,
      "texto",
      { tipo: "otro", producto: "A1" },
      { tipo: "pedido_enviado", producto: "A1" }, // fase 5
      { tipo: "producto_visto" },
      { tipo: "producto_visto", producto: "<script>" },
      { tipo: "producto_visto", producto: "A".repeat(40) },
      { tipo: "categoria_vista", categoria: "../admin" },
      { tipo: "busqueda", termino: "taladro" }, // sin resultados
      { tipo: "busqueda", termino: "taladro", resultados: -1 },
      { tipo: "busqueda", termino: "0412-1234567", resultados: 0 },
    ]) {
      expect(limpiarEvento(malo)).toBeNull();
    }
  });
});

describe("limpiarEnvio", () => {
  it("quita repetidos del mismo envío y respeta el máximo por envío", () => {
    const eventos = [
      { tipo: "producto_visto", producto: "A1" },
      { tipo: "producto_visto", producto: "A1" },
      { tipo: "carrito", producto: "A1" },
      { tipo: "carrito", producto: "A1" }, // agregar dos veces sí cuenta dos
    ];
    expect(limpiarEnvio({ eventos })).toHaveLength(3);
    const muchos = Array.from({ length: 50 }, (_, i) => ({ tipo: "carrito", producto: `P${i}` }));
    expect(limpiarEnvio({ eventos: muchos })).toHaveLength(LIMITES.porEnvio);
    expect(limpiarEnvio({})).toEqual([]);
    expect(limpiarEnvio(null)).toEqual([]);
  });
  it("la clave sin repetir distingue la subcategoría", () => {
    expect(claveSinRepetir({ tipo: "categoria_vista", categoria: "herramientas" })).not.toBe(
      claveSinRepetir({ tipo: "categoria_vista", categoria: "herramientas", subcategoria: "1284" }),
    );
    expect(claveSinRepetir({ tipo: "carrito", producto: "A1" })).toBeNull();
  });
});

describe("permitidosPorTope", () => {
  it("deja pasar solo lo que cabe en la ventana", () => {
    expect(permitidosPorTope(10, 10, 300)).toBe(10);
    expect(permitidosPorTope(305, 10, 300)).toBe(5);
    expect(permitidosPorTope(400, 20, 300)).toBe(0);
    expect(permitidosPorTope(300, 20, 300)).toBe(20);
  });
});

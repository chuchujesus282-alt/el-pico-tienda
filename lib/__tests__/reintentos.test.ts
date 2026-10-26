import { describe, expect, it, vi } from "vitest";
import { fetchConReintentos, sinConexion } from "../db/reintentos";

const errorDeRed = (code: string) => Object.assign(new TypeError("fetch failed"), { cause: { code } });
const respuesta = (status: number) => new Response("{}", { status });

function preparar(resultados: (Response | Error)[]) {
  const base = vi.fn(async () => {
    const siguiente = resultados.shift()!;
    if (siguiente instanceof Error) throw siguiente;
    return siguiente;
  });
  const esperas: number[] = [];
  const fetch = fetchConReintentos(base, { esperar: async (ms) => void esperas.push(ms), avisar: () => {} });
  return { base, esperas, fetch };
}

describe("fetchConReintentos", () => {
  it("si sale bien a la primera, no reintenta", async () => {
    const { base, fetch } = preparar([respuesta(200)]);
    expect((await fetch("https://neon")).status).toBe(200);
    expect(base).toHaveBeenCalledTimes(1);
  });

  it("reintenta si Neon no respondió a tiempo (base dormida) y espera entre intentos", async () => {
    const { base, esperas, fetch } = preparar([errorDeRed("UND_ERR_CONNECT_TIMEOUT"), errorDeRed("ECONNREFUSED"), respuesta(200)]);
    expect((await fetch("https://neon")).status).toBe(200);
    expect(base).toHaveBeenCalledTimes(3);
    expect(esperas).toEqual([500, 1500]);
  });

  it("reintenta con 502/503 del intermediario de Neon", async () => {
    const { base, fetch } = preparar([respuesta(503), respuesta(200)]);
    expect((await fetch("https://neon")).status).toBe(200);
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("después de 3 intentos, se rinde con el último error", async () => {
    const { base, fetch } = preparar([errorDeRed("ENOTFOUND"), errorDeRed("ENOTFOUND"), errorDeRed("ENOTFOUND")]);
    await expect(fetch("https://neon")).rejects.toThrow("fetch failed");
    expect(base).toHaveBeenCalledTimes(3);
  });

  it("después de 3 intentos con 503, devuelve la respuesta tal cual", async () => {
    const { base, fetch } = preparar([respuesta(503), respuesta(503), respuesta(503)]);
    expect((await fetch("https://neon")).status).toBe(503);
    expect(base).toHaveBeenCalledTimes(3);
  });

  it("NO reintenta si la conexión se cortó a mitad (la consulta pudo haber corrido)", async () => {
    const { base, fetch } = preparar([errorDeRed("ECONNRESET"), respuesta(200)]);
    await expect(fetch("https://neon")).rejects.toThrow();
    expect(base).toHaveBeenCalledTimes(1);
  });

  it("NO reintenta errores de la consulta (400) ni otros errores del servidor", async () => {
    for (const status of [400, 500]) {
      const { base, fetch } = preparar([respuesta(status), respuesta(200)]);
      expect((await fetch("https://neon")).status).toBe(status);
      expect(base).toHaveBeenCalledTimes(1);
    }
  });
});

describe("sinConexion", () => {
  it("reconoce los errores de conexión y nada más", () => {
    expect(sinConexion(errorDeRed("EAI_AGAIN"))).toBe(true);
    expect(sinConexion(errorDeRed("ECONNRESET"))).toBe(false);
    expect(sinConexion(new Error("otra cosa"))).toBe(false);
    expect(sinConexion(null)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { REGLAS, clavesLimite, estadoLimite, mensajeLimite } from "@/lib/limiteIntentos";

const ahora = new Date("2026-10-25T15:00:00Z");
const haceMinutos = (m: number) => new Date(ahora.getTime() - m * 60_000);

describe("clavesLimite", () => {
  it("entrar cuenta por correo + IP y por IP sola, con topes distintos", () => {
    const claves = clavesLimite("entrar", "Maria@Correo.com", "190.1.2.3");
    expect(claves).toHaveLength(2);
    expect(claves[0].clave).toMatch(/^entrar:correo-ip:/);
    expect(claves[0].regla).toEqual(REGLAS.entrar.correoIp);
    expect(claves[1].clave).toMatch(/^entrar:ip:/);
    expect(claves[1].regla.max).toBeGreaterThan(claves[0].regla.max);
  });

  it("no guarda el correo ni la IP legibles", () => {
    const texto = clavesLimite("entrar", "maria@correo.com", "190.1.2.3")
      .map((c) => c.clave)
      .join(" ");
    expect(texto).not.toContain("maria");
    expect(texto).not.toContain("190.1.2.3");
  });

  it("el mismo correo da la misma clave sin importar mayúsculas ni espacios", () => {
    const [a] = clavesLimite("entrar", " MARIA@correo.com ", "190.1.2.3");
    const [b] = clavesLimite("entrar", "maria@correo.com", "190.1.2.3");
    expect(a.clave).toBe(b.clave);
  });

  it("CGNAT: dos clientes en la misma IP tienen claves de correo distintas y comparten la de IP", () => {
    const [maria, ipMaria] = clavesLimite("entrar", "maria@correo.com", "190.1.2.3");
    const [jose, ipJose] = clavesLimite("entrar", "jose@correo.com", "190.1.2.3");
    expect(maria.clave).not.toBe(jose.clave);
    expect(ipMaria.clave).toBe(ipJose.clave);
  });

  it("el registro solo cuenta por IP", () => {
    const claves = clavesLimite("registro", "maria@correo.com", "190.1.2.3");
    expect(claves).toHaveLength(1);
    expect(claves[0].clave).toMatch(/^registro:ip:/);
  });

  it("sin IP cuenta todo junto", () => {
    expect(clavesLimite("entrar", null, null)).toHaveLength(1);
    expect(clavesLimite("entrar", "a@b.co", null)[1].clave).toBe(clavesLimite("entrar", "c@d.co", null)[1].clave);
  });
});

describe("estadoLimite", () => {
  const regla = { max: 5, ventanaMinutos: 15 };

  it("sin intentos no bloquea", () => {
    expect(estadoLimite(undefined, regla, ahora)).toEqual({ bloqueado: false });
  });

  it("por debajo del tope no bloquea", () => {
    expect(estadoLimite({ conteo: 4, inicio: haceMinutos(1) }, regla, ahora)).toEqual({ bloqueado: false });
  });

  it("en el tope bloquea y dice cuántos minutos faltan", () => {
    expect(estadoLimite({ conteo: 5, inicio: haceMinutos(10) }, regla, ahora)).toEqual({ bloqueado: true, minutos: 5 });
  });

  it("al pasar la ventana se libera", () => {
    expect(estadoLimite({ conteo: 50, inicio: haceMinutos(15) }, regla, ahora)).toEqual({ bloqueado: false });
  });

  it("nunca dice 0 minutos", () => {
    const casiFin = new Date(ahora.getTime() - (15 * 60_000 - 5_000));
    expect(estadoLimite({ conteo: 9, inicio: casiFin }, regla, ahora)).toEqual({ bloqueado: true, minutos: 1 });
  });
});

describe("mensajeLimite", () => {
  it("usa singular y plural", () => {
    expect(mensajeLimite(1)).toContain("1 minuto ");
    expect(mensajeLimite(7)).toContain("7 minutos");
  });
});

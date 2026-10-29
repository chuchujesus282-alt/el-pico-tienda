import { describe, expect, it } from "vitest";
import {
  ANILLO,
  elegirIndice,
  getBannerLayout,
  INICIAL,
  indiceDelDia,
  repartoDelIndice,
  type RepartoBanners,
} from "@/lib/rotacionBanners";

// Mediodía en Caracas (UTC-4) de cada día, para no depender de la hora.
const dia = (ymd: string) => new Date(`${ymd}T16:00:00Z`);

const esperado: RepartoBanners[] = [
  INICIAL,
  {
    central1: "hogar-y-jardin",
    central2: "vehiculos",
    central3: "construccion",
    central4: "herramientas",
    horizontal1: "pinturas",
    horizontal2: "cerrajeria",
    vertical1: "tornilleria",
    vertical2: "seguridad-industrial",
    vertical3: "electricidad",
    vertical4: "griferia",
  },
  {
    central1: "electricidad",
    central2: "griferia",
    central3: "hogar-y-jardin",
    central4: "vehiculos",
    horizontal1: "construccion",
    horizontal2: "herramientas",
    vertical1: "pinturas",
    vertical2: "cerrajeria",
    vertical3: "tornilleria",
    vertical4: "seguridad-industrial",
  },
  {
    central1: "tornilleria",
    central2: "seguridad-industrial",
    central3: "electricidad",
    central4: "griferia",
    horizontal1: "hogar-y-jardin",
    horizontal2: "vehiculos",
    vertical1: "construccion",
    vertical2: "herramientas",
    vertical3: "pinturas",
    vertical4: "cerrajeria",
  },
  {
    central1: "pinturas",
    central2: "cerrajeria",
    central3: "tornilleria",
    central4: "seguridad-industrial",
    horizontal1: "electricidad",
    horizontal2: "griferia",
    vertical1: "hogar-y-jardin",
    vertical2: "vehiculos",
    vertical3: "construccion",
    vertical4: "herramientas",
  },
];

describe("getBannerLayout", () => {
  it("da el reparto de cada uno de los 5 días desde el 29 de octubre de 2026", () => {
    ["2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"].forEach((ymd, i) => {
      expect(getBannerLayout(dia(ymd))).toEqual(esperado[i]);
    });
  });

  it("el día 5 es igual al día 0", () => {
    expect(getBannerLayout(dia("2026-11-03"))).toEqual(getBannerLayout(dia("2026-10-29")));
  });

  it("cada día cada categoría sale una sola vez", () => {
    for (let i = 0; i < 5; i++) {
      expect(new Set(Object.values(repartoDelIndice(i))).size).toBe(ANILLO.length);
    }
  });

  it("cambia a la medianoche de Caracas, no de UTC", () => {
    // 30 de octubre a las 03:00 UTC = 29 de octubre a las 23:00 en Caracas: sigue siendo el día 0.
    expect(indiceDelDia(new Date("2026-10-30T03:00:00Z"))).toBe(0);
    expect(indiceDelDia(new Date("2026-10-30T04:00:00Z"))).toBe(1);
  });

  it("funciona antes del ancla", () => {
    expect(indiceDelDia(dia("2026-10-28"))).toBe(4);
  });
});

describe("elegirIndice", () => {
  const fecha = dia("2026-10-31"); // día 2

  it("apagada, siempre el día 0", () => {
    expect(elegirIndice({ fecha, activa: false })).toBe(0);
  });

  it("encendida, el día de la fecha", () => {
    expect(elegirIndice({ fecha, activa: true })).toBe(2);
  });

  it("?bannerDay válido manda, aunque esté apagada; uno inválido se ignora", () => {
    expect(elegirIndice({ fecha, activa: false, forzado: "3" })).toBe(3);
    expect(elegirIndice({ fecha, activa: true, forzado: "7" })).toBe(2);
    expect(elegirIndice({ fecha, activa: false, forzado: ["1"] })).toBe(0);
  });
});

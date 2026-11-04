import { describe, expect, it } from "vitest";
import { fotoGenerica } from "@/lib/fotosGenericas";

const BRONCE = "/productos/genericos/conexion-bronce.webp";

describe("fotoGenerica", () => {
  it("todas las conexiones de bronce llevan la foto del bronce", () => {
    for (const nombre of [
      "C.BRNCE ADAPT.ACETILENO A PROPANO",
      "C.BRNCE. CDO 90° DE COMP. 1/4\" x",
      "C.BRNCE.CONEC.MANG ESPG.xNPT MACH1/2x3/4",
      "C.BRNCE.CDO 90°COMP. x MACH1/2x1/2",
      "C.BRNCE. NIPLE HEXG. NPT MACH3/4\"x 3/4\"",
    ]) {
      expect(fotoGenerica(nombre, "GENERICO")).toBe(BRONCE);
    }
  });

  it("solo los GENERICO: un producto de marca no recibe foto de referencia", () => {
    expect(fotoGenerica("C.BRNCE.CDO 90°COMP. x MACH1/2x1/2", "STANLEY")).toBeUndefined();
    expect(fotoGenerica("C.BRNCE.CDO 90°COMP. x MACH1/2x1/2", null)).toBeUndefined();
  });

  it("un tipo sin foto todavía queda sin foto (sigue el ícono de su subcategoría)", () => {
    expect(fotoGenerica("TUERCA HEX G5NC 3/4-10", "GENERICO")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { fotoGenerica } from "@/lib/fotosGenericas";

const TORNILLO = "/productos/genericos/tornillo-hexagonal.webp";
const BRONCE = "/productos/genericos/conexion-bronce.webp";

describe("fotoGenerica", () => {
  it("los tornillos hexagonales GENERICO llevan la foto del tornillo hexagonal", () => {
    expect(fotoGenerica("TOR HEX 8.8, DIN 933 6-1,00x20", "GENERICO")).toBe(TORNILLO);
    expect(fotoGenerica('TOR HEX G5NF 3/4-16x1 1/4"', "GENERICO")).toBe(TORNILLO);
    expect(fotoGenerica("  tor  hex 8.8, DIN 931 20-2,50x100", " generico ")).toBe(TORNILLO);
  });

  it("los autorroscantes y otras clases de tornillo no (tienen otra forma)", () => {
    expect(fotoGenerica("TOR AUTO HEX 10x1-1/2", "GENERICO")).toBeUndefined();
    expect(fotoGenerica("TOR AUTOTAL HEX 12x2\"", "GENERICO")).toBeUndefined();
    expect(fotoGenerica("TOR ALLEN CIL DIN 912 10-1,50x20", "GENERICO")).toBeUndefined();
    expect(fotoGenerica('TOR DRYWALL R. GRUESA 6-9x1" LAMINA', "GENERICO")).toBeUndefined();
  });

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
    expect(fotoGenerica("TOR HEX 8.8, DIN 933 6-1,00x20", "STANLEY")).toBeUndefined();
    expect(fotoGenerica("C.BRNCE.CDO 90°COMP. x MACH1/2x1/2", null)).toBeUndefined();
  });

  it("un tipo sin foto todavía queda sin foto (sigue el ícono de su subcategoría)", () => {
    expect(fotoGenerica("TUERCA HEX G5NC 3/4-10", "GENERICO")).toBeUndefined();
  });
});

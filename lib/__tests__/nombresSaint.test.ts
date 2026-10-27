import { describe, expect, it } from "vitest";
import { nombreLegible } from "@/lib/nombresSaint";

describe("nombreLegible", () => {
  it("pasa a formato oración y escribe la marca del comienzo como marca", () => {
    expect(nombreLegible("ACESA LLAVE COMBINADA PROFESIONAL  11 mm", "ACESA")).toBe("Acesa llave combinada profesional 11 mm");
    expect(nombreLegible('3M MOPA PULIDO AZUL DOBLE CARA 8" PASO 3', "3M")).toBe('3M mopa pulido azul doble cara 8" paso 3');
    expect(nombreLegible("CMT HOJA DE CALADORA 5 PZAS JT101D", "CMT")).toBe("CMT hoja de caladora 5 pzas JT101D");
    expect(nombreLegible("STANLEY/PROMAKER DADO HEX CORTO 1/2X3/4", "STANLEY")).toBe("Stanley/promaker dado hex corto 1/2X3/4");
    // Sin marca ("S/M") o con una marca que no está en el nombre: no se agrega nada.
    expect(nombreLegible("ABRE HUECOS 6 PUNTAS", "S/M")).toBe("Abre huecos 6 puntas");
    expect(nombreLegible("LLAVE COMBINADA 6 MM", "STANLEY")).toBe("Llave combinada 6 mm");
  });

  it("respeta medidas y códigos; solo baja las unidades pegadas a un número", () => {
    expect(nombreLegible("ACESA DADO 710-3/4  33MM", "ACESA")).toBe("Acesa dado 710-3/4 33mm");
    expect(nombreLegible("GRASERA CURVA 90ª 6x1,00 - GHOCM6", "GIL")).toBe("Grasera curva 90ª 6x1,00 - GHOCM6");
    expect(nombreLegible("WESCO SIERRA CIRCULAR 7-1/4\" 1500W", "WESCO")).toBe('Wesco sierra circular 7-1/4" 1500W');
    expect(nombreLegible("CATERPILLAR HOJA CALADORA 5PZ 75MM 30TPI", "CATERPILLAR")).toBe("Caterpillar hoja caladora 5pz 75mm 30TPI");
    expect(nombreLegible("ACESA LLAVE ACODADA ESTR.3/4-25/32", "ACESA")).toBe("Acesa llave acodada estr.3/4-25/32");
  });

  it("siglas, modelos y acentos seguros", () => {
    expect(nombreLegible("MECHA PARA HIERRO HSS 8,5 mm", "TORNERIA")).toBe("Mecha para hierro HSS 8,5 mm");
    expect(nombreLegible("CORREA INDUSTRIAL TIPO A MOD A-51", "CORREAS IND")).toBe("Correa industrial tipo A mod A-51");
    expect(nombreLegible('BRUFER ALICATE DE PRESION 18" TIPO "C"', "BRUFER")).toBe('Brufer alicate de presión 18" tipo "C"');
    expect(nombreLegible("HERRAMIENTAS ELECTRICAS")).toBe("Herramientas eléctricas");
    expect(nombreLegible("HERRAMIENTAS DE MEDICION")).toBe("Herramientas de medición");
    expect(nombreLegible("MECHA P/VIDRIO 1/4\" O 7MM", "TORNERIA")).toBe('Mecha p/vidrio 1/4" o 7mm');
  });
});

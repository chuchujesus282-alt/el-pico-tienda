import { describe, expect, it } from "vitest";
import { descripcionLegible, descripcionParaMensaje, esReferencia, limpiarDescripcion, nombreLegible } from "@/lib/nombresSaint";

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

describe("descripción de Saint (Descrip2)", () => {
  const NOMBRE = "COLLET DECO PLUS PINTURA 1/4 GAL";

  it("se guarda con los espacios juntos; nada si está vacía o repite el nombre o el código", () => {
    expect(limpiarDescripcion("  AMARILLO   PRIMAVERA ", NOMBRE, "COLLET005")).toBe("AMARILLO PRIMAVERA");
    expect(limpiarDescripcion("", NOMBRE, "COLLET005")).toBeNull();
    expect(limpiarDescripcion("   ", NOMBRE, "COLLET005")).toBeNull();
    expect(limpiarDescripcion(null, NOMBRE, "COLLET005")).toBeNull();
    expect(limpiarDescripcion("collet  deco plus pintura 1/4 gal", NOMBRE, "COLLET005")).toBeNull();
    expect(limpiarDescripcion("collet005", NOMBRE, "COLLET005")).toBeNull();
  });

  it("es una referencia si no tiene espacios, tiene números y no es una medida", () => {
    for (const ref of ["01-755P-M-11", "05708", "S014-02", "MTS2", "TRU.1.3136"]) expect(esReferencia(ref)).toBe(true);
    for (const no of ["AMARILLO PRIMAVERA", "MADERA", "BOSCH", '2"', '1/2"', '1-1/2"', "10mm", "4.5KG", "6632-10 12283"]) {
      expect(esReferencia(no)).toBe(false);
    }
  });

  it('en la tienda: "Ref. …" o el formato de los nombres, con // como ·', () => {
    expect(descripcionLegible("01-755P-M-11")).toBe("Ref. 01-755P-M-11");
    expect(descripcionLegible("AMARILLO PRIMAVERA")).toBe("Amarillo primavera");
    expect(descripcionLegible("NARANJA INTENSIDAD / VINOTINTO")).toBe("Naranja intensidad / vinotinto");
    expect(descripcionLegible("SIN TERMINAL // PARA TIERRA")).toBe("Sin terminal · Para tierra");
    expect(descripcionLegible('2"')).toBe('2"');
  });

  it("en el mensaje de WhatsApp: como viene (con //), con Ref. si es una referencia", () => {
    expect(descripcionParaMensaje("AMARILLO PRIMAVERA")).toBe("AMARILLO PRIMAVERA");
    expect(descripcionParaMensaje("SIN TERMINAL // PARA TIERRA")).toBe("SIN TERMINAL // PARA TIERRA");
    expect(descripcionParaMensaje("01-755P-M-11")).toBe("Ref. 01-755P-M-11");
  });
});

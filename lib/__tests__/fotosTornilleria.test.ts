import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARCHIVOS_TORNILLERIA, fotoTornilleria } from "@/lib/fotosTornilleria";

const foto = (nombre: string) => fotoTornilleria(nombre, "tornilleria")?.replace("/productos/tornilleria/", "");

describe("fotoTornilleria", () => {
  it("cada regla apunta a un archivo que existe", () => {
    for (const archivo of ARCHIVOS_TORNILLERIA) {
      expect(existsSync(`public/productos/tornilleria/${archivo}.webp`), archivo).toBe(true);
    }
  });

  it("los productos escritos distinto pero iguales comparten foto", () => {
    expect(foto("ARANDELA 10MM COBRE 14MM X 1MM")).toBe("arandela-cobre.webp");
    expect(foto("CEXPROM ARANDELA COBRE 1/2")).toBe("arandela-cobre.webp");
    expect(foto("CEXPROM ARANDELA 14MMX20MMX1,5MM COBRE")).toBe("arandela-cobre.webp");
    expect(foto('ORRIN / AROSELLOS 1 1/16"')).toBe("orrin-arosellos.webp");
    expect(foto("ORRIN P203 5/16 X 1/8")).toBe("orrin-arosellos.webp");
    expect(foto('TOR DRYWALL R. GRUESA 6-9x1" LAMINA')).toBe("tor-drywall-r-gruesa.webp");
    expect(foto("TOR DRYWALL R.GRUESA 6-9x7/16 ESTRUCTURA")).toBe("tor-drywall-r-gruesa.webp");
    expect(foto('TUERCA CIEGA INOX 1/4"')).toBe("tuerca-ciega.webp");
    expect(foto("TUERCA CIEGA O GALV 5/16-18")).toBe("tuerca-ciega.webp");
    expect(foto("TUERCA SEGURIDAD NF  INOX 3/8-24")).toBe("tuerca-seguridad-nf.webp");
    expect(foto('ESPARRAGO    NC -NC 3/8x2"')).toBe("esparrago-g5nc-nf.webp");
    expect(foto("RAMPLUG 3/8 x 3 TIPO HILTI")).toBe("ramplug-tipo-hilti.webp");
  });

  it("lee el nombre con espacios sobrantes y minúsculas", () => {
    expect(foto("  tor  hex  g5nc  1/2-13x1\" ")).toBe("tor-hex-g5nc.webp");
    expect(foto("TOR  CARRUAJE 1/4X3/4")).toBe("tor-carruaje.webp");
  });

  it("la versión inox no se queda con la foto de la normal, ni al revés", () => {
    expect(foto("ARANDELA PLANA  INOX  1/2")).toBe("arandela-plana-inox.webp");
    expect(foto('ARANDELA PLANA 1" CADA UNA')).toBe("arandela-plana.webp");
    expect(foto("TOR ALLEN CIL INOX  DIN 912  5-0,80x30")).toBe("tor-allen-cil-inox-din-912.webp");
    expect(foto("TOR ALLEN CIL DIN 912  10-1,50x100")).toBe("tor-allen-cil-din-912.webp");
    expect(foto("RAMPLUG PLASTICO SASPITO AZUL 5/16")).toBe("ramplug-plastico-saspito-azul.webp");
    expect(foto('RAMPLUG PLASTICO AZUL 5/16"')).toBe("ramplug-plastico-azul.webp");
  });

  it("distingue los ramplug de hierro por su aro", () => {
    expect(foto('RAMPLUG DE HIERRO 3/8" CON ARO ABIERTO')).toBe("ramplug-de-hierro-con-aro-abierto.webp");
    expect(foto('RAMPLUG DE HIERRO 3/8" CON ARO CERRADO')).toBe("ramplug-de-hierro-con-aro-cerrado.webp");
    expect(foto('RAMPLUG DE HIERRO 1/2" CON ARO')).toBe("ramplug-de-hierro-con-aro.webp");
    expect(foto("RAMPLUG DE HIERRO.1/2")).toBe("ramplug-de-hierro.webp");
  });

  it("lo que no se fotografió queda sin foto", () => {
    expect(foto("TUERCA PLASTICA 1/2\"")).toBeUndefined();
    expect(foto("3M GANCHO ADHESIVO MULTIPROP. MEDIANO")).toBeUndefined();
  });

  it("solo aplica a Tornillería: un nombre parecido en otra categoría no recibe foto", () => {
    expect(fotoTornilleria("TUERCA HEX G5NC 3/4-10", "griferia")).toBeUndefined();
  });
});

import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARCHIVOS_CERRAJERIA, fotoCerrajeria } from "@/lib/fotosCerrajeria";

const foto = (nombre: string) => fotoCerrajeria(nombre, "cerrajeria")?.replace("/productos/cerrajeria/", "");

describe("fotoCerrajeria", () => {
  it("cada regla apunta a un archivo que existe", () => {
    for (const archivo of ARCHIVOS_CERRAJERIA) {
      expect(existsSync(`public/productos/cerrajeria/${archivo}.webp`), archivo).toBe(true);
    }
  });

  it("los productos escritos distinto pero iguales comparten foto", () => {
    expect(foto("CANDADO 40 MM LATON ECONOMICO")).toBe("candado-laton.webp");
    expect(foto("CISA CANDADO 50 MM PLANO LATON")).toBe("candado-laton.webp");
    expect(foto("CANDADO 90-94MM ANTICIZALLA ECONOMICO")).toBe("candado-anticizalla.webp");
    expect(foto("VIRO CANDADO ANTICIZAl FAI BY 70 mm 506")).toBe("candado-anticizalla.webp");
    expect(foto("CISA CERRADURA 83 DE 45MM DE EMBUTIR")).toBe("cerradura-embutir.webp");
    expect(foto("CERRADURA EMBUTIR 60MM ECONOMICA")).toBe("cerradura-embutir.webp");
    expect(foto('BISAGRA HIERRO ZINC AMAR. 2"')).toBe("bisagra-hierro-zinc-amar.webp");
    expect(foto('BISAGRA DE H. GALV AMARILLA 4"')).toBe("bisagra-hierro-zinc-amar.webp");
    expect(foto("BISAGRA P/GABINETE (COCINA)")).toBe("bisagra-embutir-para-cocina.webp");
    expect(foto("VISALOCK MANILLA INOX F/M 3481 CIL")).toBe("manilla-tubular.webp");
    expect(foto("JUEGO DE 4 CUÑA PLASTICAS PARA PUERTA")).toBe("cuna-de-goma-para-puerta.webp");
    expect(foto("UYUSTOOLS TOPE DE PUERTA MAGNETICO CROM.")).toBe("tope-para-puerta-de-piso.webp");
  });

  it("lee el nombre con espacios sobrantes y minúsculas", () => {
    expect(foto("  candado  20 mm  laton economico ")).toBe("candado-laton.webp");
    expect(foto("TIRADOR  GOALMA 77701")).toBe("tirador.webp");
  });

  it("no confunde las variantes de un mismo producto", () => {
    expect(foto("CORREDERA TELESCOPICA 50CM CON FRENO")).toBe("corredera-telescopica-con-freno.webp");
    expect(foto("CORREDERA TELESCOPICA 50CM SIN FRENO")).toBe("corredera-telescopica-sin-freno.webp");
    expect(foto('CONTINENTAL RUEDA GIRATORIA 4" CON FRENO')).toBe("rueda-giratoria-con-freno.webp");
    expect(foto('CONTINENTAL RUEDA GIRATORIA 4"')).toBe("rueda-giratoria.webp");
    expect(foto('RUEDA DE NYLON GIRATORIA 2" NARANJA/ROJA')).toBe("rueda-de-nylon-giratoria-naranja.webp");
    expect(foto('RUEDA NYLON GIRATORIA 3" NARANJA C/FRENO')).toBe("rueda-de-nylon-giratoria-naranja-con-freno.webp");
    expect(foto("MANILLA PLA ALUM FIJ/FIJ NEGRA")).toBe("manilla-pla-alum-fij-fij-negra.webp");
    expect(foto("MANILLA PLA ALUM FIJ/MOV ORO")).toBe("manilla-pla-alum-fij-mov-oro.webp");
    expect(foto('PASADOR ALUMINIO BRONCE 3"')).toBe("pasador-de-bronce.webp");
    expect(foto('PASADOR ALUMINIO 3"')).toBe("pasador-aluminio.webp");
    expect(foto('BISAGRA DE ACERO INOX SIN ROLINERA 2"')).toBe("bisagra-acero-inox-sin-rolinera.webp");
    expect(foto('BISAGRA DE ACERO INOX C/ROLINERA 3"')).toBe("bisagra-cromada-con-rolineras.webp");
  });

  it("la bisagra vai-ven y la de vidrio no se quedan con la foto de la cromada", () => {
    expect(foto("BISAGRA VAI-VEN DORADA/NEGRA/CROMADA")).toBe("bisagra-vai-ven.webp");
    expect(foto("BISAGRA VIDRIO TIPO U CROMADA /DORADA")).toBeUndefined();
  });

  it("los tiradores de otra forma no llevan la foto del tirador de asa", () => {
    expect(foto("TIRADOR CONCHA DE METAL CROMADA 52MM")).toBeUndefined();
    expect(foto("TIRADOR CROMADO BOTON")).toBeUndefined();
    expect(foto("TIRADOR PLASTICO HONGO TODOS LOS COLORES")).toBeUndefined();
    expect(foto("TORNILLO PARA TIRADOR C/MEDIDAS")).toBeUndefined();
  });

  it("una foto con marca a la vista solo va en esa marca", () => {
    expect(foto("LOBSTER CANDADO 60 MM BARRILITO")).toBe("candado-barrilito.webp");
    expect(foto("CISA CERRADURA GANCHO 30MM DOBLE/MEDIO")).toBe("cisa-cerradura-gancho.webp");
    expect(foto("CORREDERA TELESCOPICA 30CM SIN FRENO")).not.toBe("corredera-fgv-para-gaveta.webp");
  });

  it("lo que no se fotografió queda sin foto", () => {
    expect(foto("SECUREMME CERRADURA BLINDADA 2503")).toBeUndefined();
    expect(foto("BASIC CONTENEDOR DE RUEDAS 240LTS")).toBeUndefined();
  });

  it("solo aplica a Cerrajería: un nombre parecido en otra categoría no recibe foto", () => {
    expect(fotoCerrajeria("CANDADO 40 MM LATON ECONOMICO", "herramientas")).toBeUndefined();
  });
});

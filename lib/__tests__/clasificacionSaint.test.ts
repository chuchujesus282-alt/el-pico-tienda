import { describe, expect, it } from "vitest";
import { H, reclasificar } from "@/lib/clasificacionSaint";

// Nombres reales de Saint (categoría Herramientas) y dónde debe verlos el cliente.
const destino = (nombre: string, subcategoria = "Herramientas eléctricas") => {
  const d = reclasificar({ nombre, categoriaSlug: "herramientas", subcategoria });
  return `${d.categoria} › ${d.subcategoria}`;
};
const herr = (sub: string) => `herramientas › ${sub}`;

describe("reclasificar", () => {
  it("saca de Herramientas lo que no es herramienta", () => {
    expect(destino("BARRA DE SILICON P/CALENTAR GRUESA LARGA", "Herramientas manuales")).toBe("construccion › Adhesivos");
    expect(destino("PEDROLLO BOMBA CENTRIFUGA 1HP 110/220V")).toBe("plomeria › Bombas e hidroneumáticos");
    expect(destino("REGULADOR PARA BOMBONA R4B", "Herramientas de oxicorte")).toBe("plomeria › Gas doméstico");
    expect(destino("BIG REED GATO TIPO BOTELLA 12 TON", "Herramientas hidráulicas")).toBe("vehiculos › Gatos y elevación");
    expect(destino("GRASERA RECTA 1/8-27 NPT - GH0010", "Herramientas neumáticas")).toBe("vehiculos › Lubricación y fluidos");
    expect(destino("DOMOSA DESMALEZADORA 52CC", "Herramientas a combustión")).toBe("hogar-y-jardin › Equipos de jardín");
    expect(destino("TOLSEN NYLON P/DESMALEZADORA 2MMX15MTS", "Herramientas a combustión")).toBe(
      "hogar-y-jardin › Repuestos para equipos de jardín",
    );
    expect(destino("BELLOTA/HERRAGRO MACHETE 18\"", "Herramientas manuales")).toBe("hogar-y-jardin › Herramientas de jardín");
    expect(destino("BALANZA ELECTRONICA PARA COCINA SF-400", "Herramientas de medición")).toBe("hogar-y-jardin › Hogar");
    expect(destino("PASADOR PRESION 1/8x1\"")).toBe("tornilleria › Pasadores y chavetas");
    expect(destino("ARCOLI REMACHE 1/8\" ALUMINIO POP", "Herramientas manuales")).toBe("tornilleria › Remaches");
  });

  it("lo que parece eléctrico por un número pero es herramienta de mano", () => {
    expect(destino("IRIMO ALICATE 1000V PINTA FINA 8\"")).toBe(herr(H.manuales));
    expect(destino("NIKATO DESTORNILLADOR AISLADO 8PZ 1000V")).toBe(herr(H.manuales));
    expect(destino("STANLEY DADOS DE PUNTA 1/2X19MM", "Herramientas manuales")).toBe(herr(H.manuales));
    expect(destino("VISE G.ALICATE PRESION PUNTA LARG.9LN", "Herramientas manuales")).toBe(herr(H.manuales));
    expect(destino("BRUFER TALADRO BERBIQUI MANUAL 10\"")).toBe(herr(H.manuales));
  });

  it("separa accesorios, repuestos y máquinas de lo que Saint llama 'eléctricas'", () => {
    expect(destino("BOSCH ESMERIL ANGULAR 7\" GWS 28-180")).toBe(herr(H.electricas));
    expect(destino("BOSCH MARTILLO DEMOLEDOR GBH 220")).toBe(herr(H.electricas));
    expect(destino("DREMEL DISCO DE CORTE 1-1/4\"")).toBe(herr(H.accesorios));
    expect(destino("TAKIMA MECHA ACOPLE SDS MAX 1X20\"")).toBe(herr(H.accesorios));
    expect(destino("CARBON NORMAL 001 MOD 495")).toBe(herr(H.repuestos));
    expect(destino("CORREA INDUSTRIAL TIPO A MOD A-30")).toBe(herr(H.industriales));
    expect(destino("BOCINA P/AGITADOR REGINA")).toBe(herr(H.industriales));
    expect(destino("BOCINA P/FIAT N3 TRASERA")).toBe("vehiculos › Repuestos automotrices");
  });

  it("medición, neumáticas, soldadura y equipos de obra", () => {
    expect(destino("UNI-T PINZA DIGITAL 1000AMP AC", "Herramientas de medición")).toBe(herr(H.medicion));
    expect(destino("THOR MARTILLO NEUMATICO 31KGS", "Herramientas neumáticas")).toBe(herr(H.aire));
    expect(destino("PRESOSTATO PARA COMPRESOR MONOFASICO")).toBe(herr(H.aire));
    expect(destino("LENCO/WELTECH PINZA TIERRA COBRE 200A")).toBe(herr(H.soldadura));
    expect(destino("PINZA PORTA ELECTRODO 300AMP ECONOMICO")).toBe(herr(H.soldadura));
    expect(destino("TROMPO MEZCLADOR 1 SACO // GASOLINA", "Herramientas a combustión")).toBe(herr(H.obra));
    expect(destino("MAKITA MT TROMPO DE 1/2\" M3600B")).toBe(herr(H.electricas));
    expect(destino("KYOTO SEÑORITA RACHET 1-1/2 TON", "Herramientas manuales")).toBe(herr(H.elevacion));
    expect(destino("HOTECHE JGO TARRAJA RATCHET 1/2 A 1-1/4", "Herramientas manuales")).toBe(herr(H.metalmecanica));
  });

  it("sin regla: la subcategoría de Saint con el nombre de la web; otras categorías no se tocan", () => {
    expect(destino("PRODUCTO RARO XYZ", "Herramientas neumáticas")).toBe(herr(H.aire));
    expect(destino("PRODUCTO RARO XYZ", "Herramientas automotrices")).toBe("vehiculos › Herramientas para vehículos");
    expect(reclasificar({ nombre: "BOMBA CENTRIFUGA 1HP", categoriaSlug: "plomeria", subcategoria: "Bombas" })).toEqual({
      categoria: "plomeria",
      subcategoria: "Bombas",
    });
  });
});

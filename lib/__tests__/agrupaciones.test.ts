import { describe, expect, it } from "vitest";
import { agrupar, claveAutomatica, clasificar, leerMedida, valorMedida } from "@/lib/agrupaciones";
import type { Producto } from "@/types/catalogo";

// Nombres tal como vienen de Saint (Herramientas, 1171).
const p = (id: string, nombre: string, precio: number, marca: string | null = null): Producto => ({
  id,
  nombre,
  marca,
  precio,
  imagen: null,
  categoriaSlug: "herramientas",
  subcategoria: "Herramientas manuales",
});

describe("leerMedida", () => {
  it("lee milímetros, pulgadas y torx", () => {
    expect(leerMedida("11 mm")).toBe("11 mm");
    expect(leerMedida("15MM\"")).toBe("15 mm");
    expect(leerMedida("09MM 4709TM")).toBe("9 mm");
    expect(leerMedida("19M")).toBe("19 mm");
    expect(leerMedida("5.5MM HEX.")).toBe("5,5 mm");
    expect(leerMedida("10,5 mm")).toBe("10,5 mm");
    expect(leerMedida('10"')).toBe('10"');
    expect(leerMedida("1.1/4")).toBe('1-1/4"');
    expect(leerMedida('1 1/4"')).toBe('1-1/4"');
    expect(leerMedida("15/16")).toBe('15/16"');
    expect(leerMedida("T-30S")).toBe("T30 seguridad");
    expect(leerMedida("E18")).toBe("E18");
    expect(leerMedida("PZAS")).toBeNull();
  });

  it("ordena de menor a mayor mezclando mm y pulgadas", () => {
    const etiquetas = ['1-1/4"', "10 mm", '3/8"', "7 mm", '15/16"'];
    expect(etiquetas.sort((a, b) => valorMedida(a) - valorMedida(b))).toEqual(["7 mm", '3/8"', "10 mm", '15/16"', '1-1/4"']);
  });
});

describe("clasificar", () => {
  it("llaves combinadas: solo Acesa", () => {
    expect(clasificar("ACESA LLAVE COMBINADA PROFESIONAL 10 mm")).toEqual({
      grupo: "llave-combinada-acesa",
      etiqueta: "10 mm",
      encastre: null,
    });
    expect(clasificar("LLAVE COMBINADA 10 MM")).toBeNull(); // Stanley: queda suelta
    expect(clasificar("JGO LLAVE COMBINADA 11PZ // AZUL O NEGRO")).toBeNull();
  });

  it("dados: por marca y tipo, con encastre y medida", () => {
    expect(clasificar("ACESA DADO 710-3/4 33mm")).toMatchObject({ grupo: "dado-acesa", encastre: "3/4", etiqueta: "33 mm" });
    expect(clasificar('DADO ECONOMICO/CHINO 1/2" X 9MM')).toMatchObject({ grupo: "dado-economico", encastre: "1/2", etiqueta: "9 mm" });
    expect(clasificar('DADO ECONOMICO/CHINO LARGO 1/2" X 13MM"')).toMatchObject({ grupo: "dado-economico-largo", etiqueta: "13 mm" });
    expect(clasificar("STANLEY DADO HEXAG CORTO 3/8 X14MM")).toMatchObject({ grupo: "dado-hexagonal-corto-stanley", encastre: "3/8", etiqueta: "14 mm" });
    expect(clasificar("STANLEY DADO HEX.CORTO 1/2 X 1 1/4\"")).toMatchObject({ etiqueta: '1-1/4"' });
    expect(clasificar("STANLEY DADO LARG ESTRIA 1/2X16M")).toMatchObject({ grupo: "dado-estria-largo-stanley", etiqueta: "16 mm" });
    expect(clasificar("STANLEY DADO ESTRIA 3/4 X 1.3/4")).toMatchObject({ grupo: "dado-encastre-3-4-stanley", etiqueta: '1-3/4"' });
    expect(clasificar("STANLEY DADO P/TORX 3/8X T25")).toMatchObject({ grupo: "dado-torx-stanley", etiqueta: "T25" });
    expect(clasificar("STANLEY DADO TORX HEMBRA 1/2 E18")).toMatchObject({ etiqueta: "E18 hembra" });
    expect(clasificar("STANLEY DADO P/HEXAG.3/8X8MM")).toMatchObject({ grupo: "dado-punta-stanley", etiqueta: "8 mm" });
    expect(clasificar("STANLEY/PROMAKER DADO HEX CORTO 1/2X 5/8")).toMatchObject({ grupo: "dado-hexagonal-corto-promaker", etiqueta: '5/8"' });
    expect(clasificar("PROTO DADO LARGOS 6 PTAS. 1/4 X 5/16\"")).toMatchObject({ grupo: "dado-largo-proto", etiqueta: '5/16"' });
    expect(clasificar("DADO MAGNETICO 45MM X 5/16")).toMatchObject({ grupo: "dado-magnetico-ferrezaga", etiqueta: '5/16"' });
  });

  it("genéricos: mechas, repuestos y herramientas de mano", () => {
    expect(clasificar("MECHA PARA HIERRO HSS 10,5 mm", "TORNERIA")).toMatchObject({ grupo: "mecha-hierro-hss", etiqueta: "10,5 mm" });
    expect(clasificar("MECHAS WIDIA 12mm O 1/2", "TORNERIA")).toMatchObject({ grupo: "mecha-widia", etiqueta: '12 mm / 1/2"' });
    expect(clasificar('MECHA WIDIA 3/16"', "TORNERIA")).toMatchObject({ grupo: "mecha-widia", etiqueta: '3/16"' }); // en singular
    expect(clasificar('CUCHARA P/ALBANIL PTA. CUADRADA 9"', null)).toMatchObject({ grupo: "cuchara-albanil", etiqueta: '9"' });
    expect(clasificar('MECHA P/CONCRETO 1/2" LARGA ECONOMICA', "TORNERIA")).toMatchObject({ etiqueta: '1/2"', seccion: "Económica" });
    expect(clasificar("ROLINERA MOD 6309.ZZ.C3", "TORNERIA")).toMatchObject({ grupo: "rolinera", etiqueta: "6309 ZZ C3", seccion: "Serie 63" });
    expect(clasificar("RETEN 472-052 472-050", null)).toMatchObject({ grupo: "reten", etiqueta: "472-052 / 472-050" });
    expect(clasificar("JGO. MACHO 10 X 1,25 MM", "TORNERIA")).toMatchObject({ etiqueta: "M10 × 1,25", seccion: "Métrico" });
    expect(clasificar("JGO. MACHO NF 5/16", "TORNERIA")).toMatchObject({ etiqueta: '5/16"', seccion: "Rosca fina NF" });
    expect(clasificar("PASADOR PRESION 1/8x1-1/4", "TORNILLOS")).toMatchObject({ etiqueta: '1-1/4"', detalle: '1/8" × 1-1/4"' });
    expect(clasificar("CUCHARA PARA ALBANIL PTA. REDONDA 8\"", null)).toMatchObject({ etiqueta: '8"', seccion: "Punta redonda" });
    expect(clasificar("CORREA INDUSTRIAL TIPO A MOD a-17 o A-18", "CORREAS IND")).toMatchObject({ grupo: "correa-a", etiqueta: "A-17 / A-18" });
    // Con una marca real, aunque el nombre coincida, queda suelto.
    expect(clasificar('LIMA TRIANGULAR 4"', "NICHOL")).toBeNull();
    expect(clasificar('MECHA P/CONCRETO SDS PLUS 1/2X6"', "MILWAUKEE")).toBeNull();
  });

  it("los sueltos quedan sueltos", () => {
    expect(clasificar("STANLEY DADO P/BUJIA 1/2 X 5/8")).toBeNull();
    expect(clasificar("BAHCO JGO DADOS 1/4\" 25 PZAS.")).toBeNull();
    expect(clasificar("3M MOPA PULIDO AZUL DOBLE CARA 8\" PASO 3")).toBeNull();
  });
});

describe("agrupar", () => {
  const lista = [
    p("GN0001", "ABRE HUECOS 6 PUNTAS", 3),
    p("ACS0089", "ACESA LLAVE COMBINADA PROFESIONAL 18 mm", 15.44, "ACESA"),
    p("ACS0103", "ACESA LLAVE COMBINADA PROFESIONAL 3/8", 7.49, "ACESA"),
    p("ACS0081", "ACESA LLAVE COMBINADA PROFESIONAL 10 mm", 7.49, "ACESA"),
    p("3M0015", "3M MOPA PULIDO AZUL DOBLE CARA 8\" PASO 3", 80.44, "3M"),
    p("ACS0164", "ACESA DADO 1/2 32 mm", 16.41, "ACESA"), // un solo dado Acesa: queda suelto
  ];
  const { productos, listado, grupos, grupoDe } = agrupar(lista);

  it("en la lista, el grupo es UNA tarjeta en el lugar de su primer producto, con el precio más bajo", () => {
    expect(listado.map((x) => x.id)).toEqual(["GN0001", "grupo-llave-combinada-acesa", "3M0015", "ACS0164"]);
    const tarjeta = listado[1];
    expect(tarjeta).toMatchObject({ titulo: "Llave combinada Acesa", precio: 7.49, variantes: 3, marca: "ACESA" });
    expect(tarjeta.imagen).toMatch(/llave-combinada/);
  });

  it("medidas ordenadas: milímetros y luego pulgadas", () => {
    const g = grupos.get("grupo-llave-combinada-acesa")!;
    expect(g.variantes.map((v) => [v.seccion, v.etiqueta])).toEqual([
      ["Milímetros", "10 mm"],
      ["Milímetros", "18 mm"],
      ["Pulgadas", '3/8"'],
    ]);
  });

  it("cada medida conserva su código y precio, con nombre claro y la foto del grupo", () => {
    const llave = productos.find((x) => x.id === "ACS0081")!;
    expect(llave).toMatchObject({ precio: 7.49, titulo: "Llave combinada Acesa 10 mm" });
    expect(llave.imagen).toMatch(/llave-combinada/);
    expect(grupoDe.get("ACS0081")).toBe("grupo-llave-combinada-acesa");
    expect(productos).toHaveLength(lista.length);
  });

  it("la foto del dado es solo de los Acesa: los demás dados van agrupados pero sin foto", () => {
    const { grupos: g } = agrupar([
      p("ACS0214", "ACESA DADO 710-3/4 33mm", 25.1, "ACESA"),
      p("ACS0219", "ACESA DADO 710-3/4 41mm", 64.63, "ACESA"),
      p("STLY0540", "STANLEY DADO HEXAG CORTO 3/8 X 8MM", 5.65, "STANLEY"),
      p("STLY0538", "STANLEY DADO HEXAG CORTO 3/8 X10MM", 5.95, "STANLEY"),
      p("GN98023", 'DADO ECONOMICO/CHINO 1/2" 10 MM', 4.43),
      p("GN98027", 'DADO ECONOMICO/CHINO 1/2" 14 MM', 5.35),
    ]);
    expect(g.get("grupo-dado-acesa")!.tarjeta.imagen).toMatch(/dado-cromado/);
    for (const id of ["grupo-dado-hexagonal-corto-stanley", "grupo-dado-economico"]) {
      const grupo = g.get(id)!;
      expect(grupo.tarjeta.imagen).toBeNull();
      expect(grupo.variantes.every((v) => v.producto.imagen === null)).toBe(true);
    }
  });

  it("los dados largos Stanley llevan su foto: una el de estría y otra el hexagonal", () => {
    const { grupos: g } = agrupar([
      p("STLY0496", "STANLEY DADO LARGO ESTRIA 1/2X 10M", 13.26, "STANLEY"),
      p("STLY0490", "STANLEY DADO LARG ESTRIA 1/2X16M", 15.58, "STANLEY"),
      p("STLY2092", "STANLEY DADOS LARG.HEX.1/4X 12MM 86100G", 6.81, "STANLEY"),
      p("STLY0519", "STANLEY DADO LARGO MET.1/4X5.5MM HEX.", 10.14, "STANLEY"),
    ]);
    for (const [id, foto] of [
      ["grupo-dado-estria-largo-stanley", /dado-largo-estria-stanley/],
      ["grupo-dado-hexagonal-largo-stanley", /dado-largo-stanley.webp/],
    ] as const) {
      const grupo = g.get(id)!;
      expect(grupo.tarjeta.imagen).toMatch(foto);
      expect(grupo.variantes.every((v) => v.producto.imagen === grupo.tarjeta.imagen)).toBe(true);
    }
  });

  it("la mopa 3M lleva su foto", () => {
    expect(productos.find((x) => x.id === "3M0015")!.imagen).toBe("/productos/3M0015.webp");
  });
});

describe("grupos automáticos (misma marca y nombre, cambia la medida)", () => {
  it("lee la medida y deja el nombre limpio", () => {
    expect(claveAutomatica("MANDARRIA MANGO FIBRA ECONOMICA 10LBS", null)).toEqual({
      clave: "|MANDARRIA MANGO FIBRA ECONOMICA",
      base: "MANDARRIA MANGO FIBRA ECONOMICA",
      etiqueta: "10 lb",
    });
    expect(claveAutomatica('BRUFER CEPILLO CON ESPIGA DE 1/2"', "BRUFER")?.base).toBe("BRUFER CEPILLO CON ESPIGA");
    expect(claveAutomatica("BIG REED GATO TIPO BOTELLA 12 TON", "BIG REED")?.etiqueta).toBe("12 t");
    expect(claveAutomatica('NIKATO CIZALLA CORTA PERNOS 12" 304MM', "NIKATO")?.etiqueta).toBe('12" × 304 mm');
    expect(claveAutomatica('ELECTRODO P/ALUMINIO 3/32" CADA UNO', null)?.base).toBe("ELECTRODO P/ALUMINIO CADA UNO");
  });

  it("no confunde con medidas lo que no lo es", () => {
    expect(claveAutomatica("CARBON NORMAL 001 MOD 495", null)).toBeNull();
    expect(claveAutomatica("ESTAÑO EN TUBO 60/40 0.8 MM", null)?.etiqueta).toBe("0.8 mm");
    expect(claveAutomatica("PEARL BOMBA CENTRIFUGA 10HP 220/440 TRIF", "PEARL")?.etiqueta).toBe("10 HP");
  });

  it("agrupa por marca: con el nombre de la marca delante, aunque Saint no la traiga en el campo", () => {
    const { listado, grupos } = agrupar([
      p("N1", 'NIKATO LLAVE DE TUBO 14"', 20, "NIKATO"),
      p("N2", 'NIKATO LLAVE DE TUBO 8"', 10, "NIKATO"),
      p("R1", 'RIDGID LLAVE DE TUBO 12"', 40, "RIDGID"),
      p("R2", 'RIDGID LLAVE DE TUBO 14"', 45, "RIDGID"),
      p("B1", 'BRUFER LLAVE AJUSTABLE CROMADA 8"', 6),
      p("B2", 'BRUFER LLAVE AJUSTABLE CROMADA 6"', 5, "BRUFER"),
      p("S1", "PRODUCTO SIN MEDIDA", 1),
    ]);
    expect(listado).toHaveLength(4);
    const nikato = [...grupos.values()].find((g) => g.titulo === "Nikato llave de tubo")!;
    expect(nikato.tarjeta.precio).toBe(10);
    expect(nikato.tarjeta.marca).toBe("NIKATO");
    expect(nikato.variantes.map((v) => v.etiqueta)).toEqual(['8"', '14"']);
    expect(nikato.variantes[0].producto.titulo).toBe('Nikato llave de tubo 8"');
    expect([...grupos.values()].some((g) => g.variantes.map((v) => v.id).sort().join() === "B1,B2")).toBe(true);
  });

  it("un producto solo, o uno que ya tiene su regla, no arma grupo automático", () => {
    const { grupos } = agrupar([
      p("ACS0081", "ACESA LLAVE COMBINADA PROFESIONAL 10 mm", 7.49, "ACESA"),
      p("ACS0089", "ACESA LLAVE COMBINADA PROFESIONAL 18 mm", 15.44, "ACESA"),
      p("X1", 'TRUPER LLAVE DE TUBO 10"', 9, "TRUPER"),
    ]);
    expect([...grupos.keys()]).toEqual(["grupo-llave-combinada-acesa"]);
  });
});
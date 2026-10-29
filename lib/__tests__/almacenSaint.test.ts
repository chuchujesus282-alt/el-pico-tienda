import { describe, expect, it } from "vitest";
import { crearAlmacenSaint, type EntradaSaint, type LecturaSaint } from "@/lib/almacenSaint";

// Reloj de mentira y una caché compartida que se porta como unstable_cache: vacía → pide y guarda; vencida → devuelve
// lo guardado y renueva en segundo plano (si la renovación falla, se queda lo viejo).
const MIN = 60_000;

function escenario() {
  let ahora = 1_000_000;
  const reloj = { ahora: () => ahora, avanzar: (ms: number) => (ahora += ms) };
  let version = 1;
  let saintCaido = false;
  const pedidosASaint: number[] = [];

  async function pedirASaint(codigo: number): Promise<EntradaSaint> {
    pedidosASaint.push(codigo);
    if (saintCaido) throw new Error("Saint no responde");
    return { crudo: { codigo, version }, huella: `h${codigo}-${version}`, pedidoEn: reloj.ahora(), caracteres: 100 };
  }

  const guardado = new Map<number, EntradaSaint>();
  const renovando: Promise<unknown>[] = [];
  async function leerCompartida(codigo: number): Promise<EntradaSaint> {
    const entrada = guardado.get(codigo);
    if (!entrada) {
      const nueva = await pedirASaint(codigo);
      guardado.set(codigo, nueva);
      return nueva;
    }
    if (reloj.ahora() - entrada.pedidoEn > 10 * MIN) {
      renovando.push(pedirASaint(codigo).then((n) => guardado.set(codigo, n), () => {}));
    }
    return entrada;
  }

  const conversiones: string[] = [];
  const lecturas: LecturaSaint[] = [];
  const nuevoServidor = () =>
    crearAlmacenSaint<{ slug: string; crudo: unknown }>({
      leerCompartida,
      pedirDirecto: pedirASaint,
      convertir: (slug, crudo) => {
        conversiones.push(slug);
        return { slug, crudo };
      },
      revisarCadaMs: MIN,
      topeMs: 15 * MIN,
      ahora: reloj.ahora,
      registrar: (l) => lecturas.push(l),
    });

  return {
    reloj,
    nuevoServidor,
    pedidosASaint,
    conversiones,
    lecturas,
    guardado,
    renovar: () => Promise.all(renovando.splice(0)),
    cambiarSaint: () => version++,
    caerSaint: (caido = true) => (saintCaido = caido),
  };
}

describe("caché compartida entre servidores", () => {
  it("un servidor recién encendido lee lo que guardó otro, sin pedirle a Saint", async () => {
    const e = escenario();
    await e.nuevoServidor().categoria("herramientas", 1171);
    expect(e.pedidosASaint).toEqual([1171]);

    e.reloj.avanzar(2 * MIN);
    await e.nuevoServidor().categoria("herramientas", 1171); // otro servidor, memoria vacía
    expect(e.pedidosASaint).toEqual([1171]);
    expect(e.lecturas.map((l) => l.origen)).toEqual(["saint", "cache"]);
  });

  it("visitas simultáneas del mismo servidor comparten un solo pedido", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    const resultados = await Promise.all(Array.from({ length: 5 }, () => servidor.categoria("herramientas", 1171)));
    expect(e.pedidosASaint).toEqual([1171]);
    expect(new Set(resultados).size).toBe(1);
  });

  it("dentro del minuto, la memoria responde sin mirar la caché compartida", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    await servidor.categoria("herramientas", 1171);
    e.reloj.avanzar(30_000);
    await servidor.categoria("herramientas", 1171);
    expect(e.lecturas).toHaveLength(1);
  });

  it("si la huella no cambió, devuelve la MISMA lista sin volver a convertir", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    const primera = await servidor.categoria("herramientas", 1171);
    e.reloj.avanzar(2 * MIN);
    const segunda = await servidor.categoria("herramientas", 1171);
    expect(segunda).toBe(primera);
    expect(e.conversiones).toEqual(["herramientas"]);
  });
});

describe("tope de 15 minutos", () => {
  it("entre 10 y 15 minutos sirve lo guardado y lo renueva en segundo plano", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    await servidor.categoria("herramientas", 1171);
    e.cambiarSaint();
    e.reloj.avanzar(12 * MIN);
    const vieja = await servidor.categoria("herramientas", 1171);
    expect(vieja.crudo).toEqual({ codigo: 1171, version: 1 });
    await e.renovar();
    e.reloj.avanzar(2 * MIN);
    const nueva = await servidor.categoria("herramientas", 1171);
    expect(nueva.crudo).toEqual({ codigo: 1171, version: 2 });
  });

  it("con más de 15 minutos, esa visita espera el pedido nuevo a Saint", async () => {
    const e = escenario();
    await e.nuevoServidor().categoria("herramientas", 1171);
    e.cambiarSaint();
    e.reloj.avanzar(3 * 60 * MIN); // de madrugada, sin visitas
    const lista = await e.nuevoServidor().categoria("herramientas", 1171);
    expect(lista.crudo).toEqual({ codigo: 1171, version: 2 });
    expect(e.lecturas.at(-1)?.origen).toBe("tope");
  });
});

describe("si Saint falla", () => {
  it("pasado el tope, sirve lo guardado en la caché compartida (nunca se queda sin productos)", async () => {
    const e = escenario();
    await e.nuevoServidor().categoria("herramientas", 1171);
    e.caerSaint();
    e.reloj.avanzar(60 * MIN);
    const lista = await e.nuevoServidor().categoria("herramientas", 1171); // servidor nuevo, memoria vacía
    expect(lista.crudo).toEqual({ codigo: 1171, version: 1 });
    expect(e.lecturas.at(-1)?.origen).toBe("vencida");
  });

  it("si la caché compartida también falla, usa la última lista buena en memoria", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    const buena = await servidor.categoria("herramientas", 1171);
    e.guardado.clear(); // la caché compartida se perdió
    e.caerSaint();
    e.reloj.avanzar(2 * MIN);
    expect(await servidor.categoria("herramientas", 1171)).toBe(buena);
  });

  it("si nunca hubo nada, lanza el error", async () => {
    const e = escenario();
    e.caerSaint();
    await expect(e.nuevoServidor().categoria("herramientas", 1171)).rejects.toThrow("Saint no responde");
  });
});

describe("lista completa a partir de las categorías", () => {
  const MAPA = { herramientas: 1171, construccion: 1498, pinturas: 1835 };

  it("junta todas las categorías guardadas, sin pedir nada más a Saint", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    await Promise.all(Object.entries(MAPA).map(([slug, codigo]) => servidor.categoria(slug, codigo)));
    const pedidosAntes = e.pedidosASaint.length;
    const { listas, completo } = await servidor.todas(MAPA);
    expect(listas.map((l) => l.slug)).toEqual(["herramientas", "construccion", "pinturas"]);
    expect(completo).toBe(true);
    expect(e.pedidosASaint).toHaveLength(pedidosAntes);
  });

  it("si una categoría falla, las demás siguen y queda completo: false", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    await servidor.categoria("herramientas", 1171);
    await servidor.categoria("construccion", 1498);
    e.caerSaint(); // pinturas nunca se pudo pedir
    const { listas, completo, fallidas } = await servidor.todas(MAPA);
    expect(listas.map((l) => l.slug)).toEqual(["herramientas", "construccion"]);
    expect(completo).toBe(false);
    expect(fallidas).toEqual(["pinturas"]);
  });

  it("mientras nada cambie, devuelve las mismas listas (el índice de búsqueda no se rehace)", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    const primera = await servidor.todas(MAPA);
    e.reloj.avanzar(2 * MIN);
    const segunda = await servidor.todas(MAPA);
    segunda.listas.forEach((lista, i) => expect(lista).toBe(primera.listas[i]));
  });

  it("olvidar hace que la próxima visita vuelva a mirar la caché compartida", async () => {
    const e = escenario();
    const servidor = e.nuevoServidor();
    await servidor.categoria("herramientas", 1171);
    servidor.olvidar(1171);
    await servidor.categoria("herramientas", 1171);
    expect(e.lecturas).toHaveLength(2);
  });
});

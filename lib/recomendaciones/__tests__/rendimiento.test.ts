import { describe, expect, it } from "vitest";
import { catalogoPruebas as productosMock } from "@/lib/mock/catalogoPruebas";
import type { Producto } from "@/types/catalogo";
import { buscar, crearIndice, crearIndicePorPartes, sugerir, sugerirCorrigiendo } from "../busqueda";
import { tePuedeInteresar } from "../interesar";
import { relacionados } from "../relacionados";

// Catálogo inventado de 2000 productos: variantes de los de prueba con otras medidas, marcas y colores.
function catalogoGrande(cantidad = 2000): Producto[] {
  const medidas = ['1/8"', '1/4"', '3/8"', '1/2"', '5/8"', '3/4"', '1"', '1 1/2"', '2"', "5MTS", "10KG", "1 GALON"];
  const extras = ["NEGRO", "BLANCO", "GALVANIZADO", "REFORZADO", "PROFESIONAL", "ECONOMICO", "INOX", "PLASTICO"];
  return Array.from({ length: cantidad }, (_, i) => {
    const base = productosMock[i % productosMock.length];
    return {
      ...base,
      id: `G${String(i).padStart(5, "0")}`,
      nombre: `${base.nombre} ${extras[i % extras.length]} ${medidas[(i * 7) % medidas.length]}`,
      marca: `MARCA${i % 40}`,
      precio: base.precio * (0.7 + ((i * 13) % 60) / 100),
      ventas: (i * 37) % 500,
    };
  });
}

const CONSULTAS = ["tornilo", "tornillo 1/4", "1/4 tornillos", "mecha 3/8", "teipe", "cemento gris", "pintura caucho blanca",
  "llave inglesa", "tubo pvc 1/2", "bombillo led", "cinta", "pala", "xyzw", "brocha 3", "codo 3/4"];

describe("rendimiento con 2000 productos", () => {
  const productos = catalogoGrande();

  it("arma el índice en menos de 0,5 s y cada búsqueda tarda en promedio menos de 5 ms", () => {
    const t0 = performance.now();
    const indice = crearIndice(productos);
    const armado = performance.now() - t0;

    const t1 = performance.now();
    const vueltas = 5;
    for (let v = 0; v < vueltas; v++) for (const q of CONSULTAS) buscar(indice, q);
    const promedio = (performance.now() - t1) / (vueltas * CONSULTAS.length);

    const t2 = performance.now();
    for (const q of CONSULTAS) sugerir(indice, q.slice(0, 5));
    const sugerencia = (performance.now() - t2) / CONSULTAS.length;

    console.info(
      `Índice: ${armado.toFixed(0)} ms · búsqueda: ${promedio.toFixed(2)} ms · sugerencia: ${sugerencia.toFixed(2)} ms (2000 productos)`,
    );
    expect(armado).toBeLessThan(500); // ~150 ms en una PC modesta; se arma una sola vez
    expect(promedio).toBeLessThan(5);
  });

  it("el índice por partes (navegador) da lo mismo que el de un tirón y nunca bloquea más de 150 ms seguidos", async () => {
    const grande = catalogoGrande(4000);
    const deUnTiron = crearIndice(grande.map((p) => ({ ...p }))); // otra lista: sin caché compartida
    // Mide el tramo más largo sin ceder el turno: un reloj que intenta correr cada 0 ms anota los huecos.
    let ultimo = performance.now(),
      hueco = 0,
      corriendo = true;
    const reloj = () => {
      const ahora = performance.now();
      hueco = Math.max(hueco, ahora - ultimo);
      ultimo = ahora;
      if (corriendo) setTimeout(reloj, 0);
    };
    setTimeout(reloj, 0);
    const porPartes = await crearIndicePorPartes(grande);
    corriendo = false;
    console.info(`Índice por partes (4000): tramo más largo sin ceder el turno ${hueco.toFixed(0)} ms`);
    expect(hueco).toBeLessThan(150);
    for (const q of CONSULTAS) {
      expect(buscar(porPartes, q).productos.map((p) => p.id)).toEqual(buscar(deUnTiron, q).productos.map((p) => p.id));
      expect(sugerir(porPartes, q.slice(0, 5)).map((p) => p.id)).toEqual(sugerir(deUnTiron, q.slice(0, 5)).map((p) => p.id));
    }
    expect(crearIndice(grande)).toBe(porPartes); // misma caché: no se vuelve a armar
  });

  it("relacionados y 'Te puede interesar' responden rápido", () => {
    const t0 = performance.now();
    for (const p of productos.slice(0, 50)) relacionados(p, productos);
    const porProducto = (performance.now() - t0) / 50;

    const ahora = Date.now();
    const senales = productos.slice(0, 200).map((p, i) => ({
      tipo: (["whatsapp", "carrito", "visto"] as const)[i % 3],
      id: p.id,
      fecha: ahora - i * 3600_000,
    }));
    const t1 = performance.now();
    tePuedeInteresar({ productos, senales, ahora });
    const interesar = performance.now() - t1;

    console.info(`Relacionados: ${porProducto.toFixed(1)} ms por producto · Te puede interesar (200 señales): ${interesar.toFixed(0)} ms`);
    expect(porProducto).toBeLessThan(50);
    expect(interesar).toBeLessThan(500);
  });
});

// Con el catálogo que tendrá la tienda (~30.000 productos de Saint), en el SERVIDOR (lib/indiceServidor.ts): el índice
// se arma una vez y cada sugerencia, búsqueda o "Te puede interesar" usa ese mismo índice. Límites holgados (una PC
// modesta con poca memoria); los números reales se imprimen para el reporte.
describe("rendimiento con 30.000 productos (índice en el servidor)", () => {
  const productos = catalogoGrande(30_000);
  const indice = crearIndice(productos);

  it("arma el índice, sugiere, busca y recomienda en tiempos de servidor", async () => {
    const otra = productos.map((p) => ({ ...p })); // otra lista: sin caché compartida
    const t0 = performance.now();
    await crearIndicePorPartes(otra);
    const armado = performance.now() - t0;

    const vueltas = 3;
    const t1 = performance.now();
    for (let v = 0; v < vueltas; v++) for (const q of CONSULTAS) sugerirCorrigiendo(indice, q.slice(0, 6), 6);
    const sugerencia = (performance.now() - t1) / (vueltas * CONSULTAS.length);

    const t2 = performance.now();
    for (let v = 0; v < vueltas; v++) for (const q of CONSULTAS) buscar(indice, q);
    const busqueda = (performance.now() - t2) / (vueltas * CONSULTAS.length);

    const t3 = performance.now();
    for (const p of productos.slice(0, 20)) relacionados(p, productos);
    const porProducto = (performance.now() - t3) / 20;

    const ahora = Date.now();
    const senales = productos.slice(0, 50).map((p, i) => ({
      tipo: (["whatsapp", "carrito", "visto"] as const)[i % 3],
      id: p.id,
      fecha: ahora - i * 3600_000,
    }));
    const t4 = performance.now();
    tePuedeInteresar({ productos, senales, indice, ahora, limite: 10 });
    const interesar = performance.now() - t4;

    console.info(
      `30.000 productos · índice (por partes): ${armado.toFixed(0)} ms · sugerencia: ${sugerencia.toFixed(2)} ms · ` +
        `búsqueda: ${busqueda.toFixed(2)} ms · relacionados: ${porProducto.toFixed(1)} ms · Te puede interesar (50 señales): ${interesar.toFixed(1)} ms`,
    );
    expect(armado).toBeLessThan(5000);
    expect(sugerencia).toBeLessThan(25);
    expect(busqueda).toBeLessThan(50);
    expect(porProducto).toBeLessThan(150);
    expect(interesar).toBeLessThan(500);
  }, 60_000);
});

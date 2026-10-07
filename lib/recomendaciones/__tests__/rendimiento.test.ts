import { describe, expect, it } from "vitest";
import { productosMock } from "@/lib/mock/productos";
import type { Producto } from "@/types/catalogo";
import { buscar, crearIndice, sugerir } from "../busqueda";
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

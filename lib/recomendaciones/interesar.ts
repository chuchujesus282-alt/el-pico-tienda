import type { Producto } from "@/types/catalogo";
import type { IndiceBusqueda } from "./busqueda";
import { sugerir } from "./busqueda";
import { esConsumible } from "./diccionarios";
import { pesoSenal } from "./perfil";
import { masVendidos, prepararCatalogo, ventas } from "./productos";
import { complementariosDe, similaresDe } from "./relacionados";
import type { Senal } from "./tipos";

// "Te puede interesar" personalizado. Recibe las señales (del navegador y, en el futuro, de las compras del SQL)
// y devuelve productos ordenados por puntaje. Sin señales: los más vendidos.

type Opciones = {
  productos: Producto[];
  senales: Senal[];
  /** IDs en el carrito: no se sugieren, salvo los consumibles. */
  enCarrito?: string[];
  /** Para convertir búsquedas en productos (opcional). */
  indice?: IndiceBusqueda;
  limite?: number;
  ahora?: number;
};

const FUERTES = new Set(["compra", "whatsapp", "carrito"]);
/** Solo se exploran los productos con más peso de cada grupo (las señales viejas casi no suman). */
const MAXIMO_BASES = 20;

const principales = (pesos: Map<string, number>) =>
  [...pesos].sort((a, b) => b[1] - a[1]).slice(0, MAXIMO_BASES);

export function tePuedeInteresar({ productos, senales, enCarrito = [], indice, limite = 10, ahora = Date.now() }: Opciones): Producto[] {
  const { lista, porId } = prepararCatalogo(productos);

  // 1. Peso actual de cada producto según lo que hizo el cliente (fuertes: pedido/carrito; débiles: visto).
  const fuertes = new Map<string, number>();
  const vistos = new Map<string, number>();
  const busquedas = new Map<string, number>();
  for (const s of senales) {
    const peso = pesoSenal(s, ahora);
    if (s.tipo === "busqueda" && s.termino) busquedas.set(s.termino, (busquedas.get(s.termino) ?? 0) + peso);
    else if (s.id && FUERTES.has(s.tipo)) fuertes.set(s.id, (fuertes.get(s.id) ?? 0) + peso);
    else if (s.id) vistos.set(s.id, (vistos.get(s.id) ?? 0) + peso);
  }

  // Lo que ya está en el carrito o ya se pidió no se vuelve a sugerir, salvo que sea consumible.
  const pedidos = senales.filter((s) => s.tipo === "whatsapp" || s.tipo === "compra").map((s) => s.id);
  const excluir = new Set(
    [...enCarrito, ...pedidos].filter((id): id is string => !!id && !(porId.has(id) && esConsumible(porId.get(id)!))),
  );

  // 2. Candidatos con puntaje.
  const puntajes = new Map<string, number>();
  const sumar = (id: string, puntos: number) => {
    if (!excluir.has(id)) puntajes.set(id, (puntajes.get(id) ?? 0) + puntos);
  };
  const decrece = (i: number) => Math.max(0.3, 1 - i * 0.1); // el primero de cada lista vale más

  for (const [id, peso] of principales(fuertes)) {
    const base = porId.get(id);
    if (!base) continue;
    complementariosDe(base, lista, 6).forEach((p, i) => sumar(p.producto.id, peso * decrece(i)));
    similaresDe(base, lista, 4).forEach((p, i) => sumar(p.producto.id, 0.4 * peso * decrece(i)));
  }
  for (const [id, peso] of principales(vistos)) {
    const base = porId.get(id);
    if (!base) continue;
    sumar(id, 0.6 * peso); // recordarle lo que miró
    similaresDe(base, lista, 6).forEach((p, i) => sumar(p.producto.id, peso * decrece(i)));
    complementariosDe(base, lista, 3).forEach((p, i) => sumar(p.producto.id, 0.4 * peso * decrece(i)));
  }
  if (indice) {
    for (const [termino, peso] of principales(busquedas)) {
      sugerir(indice, termino, 5).forEach((p, i) => sumar(p.id, peso * decrece(i)));
    }
  }

  // 3. Ordenados por puntaje (a igualdad, el más vendido) y completados con los más vendidos.
  const elegidos = [...puntajes]
    .map(([id, puntaje]) => ({ p: porId.get(id)!.producto, puntaje }))
    .sort((a, b) => b.puntaje - a.puntaje || ventas(b.p) - ventas(a.p))
    .slice(0, limite)
    .map((x) => x.p);

  if (elegidos.length < limite) {
    const ya = new Set([...excluir, ...elegidos.map((p) => p.id)]);
    elegidos.push(...masVendidos(productos, limite - elegidos.length, { excluir: ya }));
  }
  return elegidos;
}

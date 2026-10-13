import { formatearPrecio } from "@/lib/formato";
import { MATERIALES, type IdMaterial, type Material } from "@/lib/calculadoras/materiales";
import type { Calculadora, Entrada, Resultado } from "@/lib/calculadoras/tipos";
import type { Producto } from "@/types/catalogo";

// Lógica del "Resumen de tu proyecto" (sin React): arma las líneas, los totales y el texto para compartir.

/** Productos del catálogo que usa la calculadora, por código. Lo arma la página en el servidor. */
export type ProductosPorCodigo = Record<string, Producto>;

export type LineaResumen = {
  material: IdMaterial;
  info: Material;
  /** null: el material no tiene producto en el catálogo → "Consultar disponibilidad". */
  producto: Producto | null;
  /** Cantidad que sale del cálculo; null en las herramientas (las elige el cliente). */
  recomendada: number | null;
  cantidad: number;
  nota?: string;
};

/** Cantidades que el cliente cambió a mano. La clave incluye la recomendada: si el cálculo cambia, el ajuste se descarta. */
export type Ajustes = Record<string, number>;
export const claveAjuste = (material: IdMaterial, recomendada: number | null) => `${material}:${recomendada ?? "extra"}`;

export const CANTIDAD_MAXIMA = 9999;

/** Texto escrito por el cliente → número (acepta coma o punto decimal). NaN si no es un número. */
export function leerNumero(texto: string): number {
  const limpio = texto.trim().replace(/\s/g, "").replace(",", ".");
  return /^\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : Number.NaN;
}

export function armarLineas(
  resultado: Resultado | null,
  extras: IdMaterial[],
  ajustes: Ajustes,
  productos: ProductosPorCodigo,
): LineaResumen[] {
  const productoDe = (id: IdMaterial) => {
    const codigo = MATERIALES[id].productoId;
    return codigo ? (productos[codigo] ?? null) : null;
  };
  const delCalculo: LineaResumen[] = (resultado?.materiales ?? []).map((m) => ({
    material: m.material,
    info: MATERIALES[m.material],
    producto: productoDe(m.material),
    recomendada: m.cantidad,
    cantidad: ajustes[claveAjuste(m.material, m.cantidad)] ?? m.cantidad,
    nota: m.nota,
  }));
  const elegidos: LineaResumen[] = extras.map((id) => ({
    material: id,
    info: MATERIALES[id],
    producto: productoDe(id),
    recomendada: null,
    cantidad: ajustes[claveAjuste(id, null)] ?? 1,
  }));
  return [...delCalculo, ...elegidos];
}

export function totales(lineas: LineaResumen[]) {
  const conPrecio = lineas.filter((l) => l.producto && l.cantidad > 0);
  return {
    articulos: lineas.reduce((suma, l) => suma + l.cantidad, 0),
    totalUsd: conPrecio.reduce((suma, l) => suma + l.producto!.precio * l.cantidad, 0),
    /** Líneas que sí se pueden agregar al carrito. */
    paraCarrito: conPrecio,
    /** Materiales sin producto: se consultan por WhatsApp. */
    porConsultar: lineas.filter((l) => !l.producto && l.cantidad > 0),
  };
}

/** Resumen en texto plano para compartir por WhatsApp. */
export function textoParaCompartir(calculadora: Calculadora, entrada: Entrada, resultado: Resultado, lineas: LineaResumen[]): string {
  const medidas = calculadora.campos
    .filter((c) => entrada.medidas[c.id] > 0)
    .map((c) => `${c.etiqueta}: ${new Intl.NumberFormat("es-VE").format(entrada.medidas[c.id])} ${c.unidad}`);
  const opciones = calculadora.grupos.map((g) => {
    const elegida = g.opciones.find((o) => o.valor === entrada.opciones[g.id]);
    return `${g.etiqueta}: ${elegida?.etiqueta ?? "—"}`;
  });
  const materiales = lineas
    .filter((l) => l.cantidad > 0)
    .map((l) => {
      const precio = l.producto ? ` — ${formatearPrecio(l.producto.precio * l.cantidad)}` : " — consultar disponibilidad";
      return `• ${l.cantidad} × ${l.info.nombre} (${l.info.presentacion})${precio}`;
    });
  const { totalUsd } = totales(lineas);
  return [
    `*${calculadora.titulo}* — Centro Ferretero El Pico`,
    "",
    ...medidas,
    ...opciones,
    ...resultado.datos.map((d) => `${d.etiqueta}: ${d.valor}`),
    "",
    "Materiales:",
    ...materiales,
    "",
    `Total referencial: ${formatearPrecio(totalUsd)}`,
    "",
    "Cálculo referencial: las cantidades pueden variar según la obra.",
  ].join("\n");
}

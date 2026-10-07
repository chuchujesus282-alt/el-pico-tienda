import type { Producto } from "@/types/catalogo";

const numeroVE = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1289.5 → "$ 1.289,50" (el espacio no se parte en dos líneas). */
export function formatearPrecio(usd: number): string {
  return `$ ${numeroVE.format(usd)}`;
}

// Los nombres llegan del sistema en MAYÚSCULAS ("TALADRO PERCUTOR 1/2" 650W").
// Para mostrarlos (tarjetas, carrito, página de producto) se pasan a minúsculas (formato oración) y se agrega la marca
// antes de la primera medida: "Taladro percutor Protek 1/2" 650W".

/** Siglas que se mantienen en mayúsculas. */
const SIGLAS = new Set(["PVC", "CPVC", "LED", "THW", "PPR", "HP", "UV", "USB", "AC", "DC"]);

/** Unidades que se escriben en mayúscula al final de una medida: 650W, 110V, 20A, 1/2HP. */
const UNIDAD_MAYUSCULA = /(\d)(w|v|a|hp)$/;

/** Una medida: fracciones o pulgadas (1/2, 3"), número con unidad (12W, 5MTS), dimensiones (15X20) o calibre (#12). */
function esMedida(palabra: string): boolean {
  return /["/]/.test(palabra) || /^\d+([.,]\d+)?[A-Z]+$/.test(palabra) || /^\d+X\d+/.test(palabra) || /^#\d+/.test(palabra);
}

function formatearPalabra(palabra: string): string {
  if (SIGLAS.has(palabra)) return palabra;
  if (/^[A-Z]\d+$/.test(palabra)) return palabra; // E27, N95
  if (/^\d+W\d+$/.test(palabra)) return palabra; // viscosidad de aceite: 20W50
  const minuscula = palabra.toLowerCase();
  return /\d/.test(palabra) ? minuscula.replace(UNIDAD_MAYUSCULA, (_, d: string, u: string) => d + u.toUpperCase()) : minuscula;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/** Título legible del producto, con la marca incluida. */
export function tituloProducto({ nombre, marca }: Pick<Producto, "nombre" | "marca">): string {
  const palabras = nombre.trim().split(/\s+/);
  const formateadas = palabras.map(formatearPalabra);
  formateadas[0] = formateadas[0].charAt(0).toUpperCase() + formateadas[0].slice(1);

  if (marca) {
    let posicion = palabras.findIndex(esMedida);
    // "1 1/2"" es una sola medida: la marca va antes del número entero.
    if (posicion > 0 && /^\d+$/.test(palabras[posicion - 1])) posicion -= 1;
    formateadas.splice(posicion > 0 ? posicion : formateadas.length, 0, capitalizar(marca));
  }
  return formateadas.join(" ");
}

import type { Calificacion, Opinion } from "@/types/opiniones";

// Opiniones FALSAS de prueba, solo para ver el diseño mientras no hay base de datos.
// Nunca se muestran con CATALOGO_API_URL definida (ver lib/opiniones.ts).

const autores = [
  "María G.", "José R.", "Carmen L.", "Luis P.", "Ana M.", "Carlos V.", "Rosa T.", "Pedro A.",
  "Yelitza C.", "Jesús F.", "Daniela S.", "Miguel H.", "Andreína B.", "Rafael O.",
];

const comentarios: [Calificacion, string][] = [
  [5, "Excelente calidad, justo lo que necesitaba para la obra."],
  [5, "Muy buen producto y la atención por WhatsApp fue rápida."],
  [4, "Cumple bien. El precio está acorde a lo que ofrece."],
  [5, "Ya es la segunda vez que lo compro, sigue saliendo bueno."],
  [4, "Buen material, aunque me hubiera gustado que viniera con instrucciones."],
  [3, "Funciona, pero esperaba un acabado un poco mejor."],
  [5, "Me asesoraron sobre la medida correcta y quedó perfecto."],
  [4, "Buena relación precio-calidad. Lo recomiendo."],
  [2, "Tuve que cambiarlo por otra medida, pero me ayudaron sin problema."],
  [5, "Resistente y fácil de usar. Muy contento con la compra."],
  [4, "Llegó bien empacado y en el tiempo acordado."],
  [1, "No era lo que buscaba para mi caso, debí preguntar antes."],
];

/** Número estable a partir del código del producto, para que cada producto tenga siempre las mismas opiniones. */
function semilla(texto: string): number {
  return [...texto].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

export function opinionesMock(productoId: string): Opinion[] {
  const s = semilla(productoId);
  if (s % 6 === 0) return []; // algunos productos sin opiniones, para ver ese estado
  const cantidad = 2 + (s % 9);
  return Array.from({ length: cantidad }, (_, i) => {
    const [calificacion, comentario] = comentarios[(s + i * 5) % comentarios.length];
    const fecha = new Date(Date.UTC(2026, 8, 30) - ((s + i * 11) % 120) * 86_400_000);
    return {
      id: `${productoId}-${i}`,
      productoId,
      autor: autores[(s + i * 3) % autores.length],
      calificacion,
      comentario,
      fecha: fecha.toISOString().slice(0, 10),
    };
  }).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

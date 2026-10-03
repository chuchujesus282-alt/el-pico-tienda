const numeroVE = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1289.5 → "$ 1.289,50" (el espacio no se parte en dos líneas). */
export function formatearPrecio(usd: number): string {
  return `$ ${numeroVE.format(usd)}`;
}

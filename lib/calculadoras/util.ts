import { MORTERO, PRESENTACION, type MezclaMortero } from "./constantes";
import type { Entrada, LineaMaterial } from "./tipos";

/** Redondea SIEMPRE hacia arriba a unidades de venta enteras (con un margen mínimo para errores de coma flotante). */
export function haciaArriba(valor: number): number {
  return Math.max(0, Math.ceil(valor - 1e-9));
}

/** Número en formato venezolano: coma decimal y punto de miles (ej. 1.234,5). */
export function numero(valor: number, decimales = 2): string {
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 0, maximumFractionDigits: decimales }).format(valor);
}

/** Medida escrita por el cliente; las opcionales vacías cuentan como 0. */
export function medida(entrada: Entrada, id: string): number {
  const valor = entrada.medidas[id];
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/** Área de pared: largo × alto menos puertas y ventanas (nunca negativa). */
export function areaPared(entrada: Entrada): number {
  return Math.max(0, medida(entrada, "largo") * medida(entrada, "alto") - medida(entrada, "vanos"));
}

/** Cemento (sacos) y arena (m³) para un volumen de mortero ya con su desperdicio. */
export function materialesMortero(volumenM3: number, mezcla: MezclaMortero): LineaMaterial[] {
  const { cementoKg, arenaM3 } = MORTERO[mezcla];
  const sacos = (volumenM3 * cementoKg) / PRESENTACION.sacoCementoKg;
  const arena = volumenM3 * arenaM3;
  return [
    {
      material: "cemento",
      cantidad: haciaArriba(sacos),
      nota: `${numero(volumenM3, 3)} m³ de mezcla ${mezcla} × ${cementoKg} kg/m³ = ${numero(sacos)} sacos`,
    },
    {
      material: "arena",
      cantidad: haciaArriba(arena),
      nota: `${numero(volumenM3, 3)} m³ de mezcla × ${numero(arenaM3)} = ${numero(arena)} m³`,
    },
  ];
}

import { Montanas } from "@/components/layout/Logo";

/**
 * Estado de carga con la misma forma que ProductCard (marco de la foto, marca, dos líneas de nombre y la fila
 * de precio + botón), con el mismo brillo que cruza de los demás esqueletos (quieto con "reducir movimiento").
 */
export default function ProductCardEsqueleto() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta" aria-hidden>
      <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-b from-pico-blanco to-pico-azul-claro/60 ring-1 ring-pico-azul/8 ring-inset">
        <Montanas className="h-1/4 w-auto fill-pico-azul/10" />
      </div>
      <div className="h-3 w-1/3 rounded-chip bg-gris-fondo" />
      <div className="mt-2 h-3.5 w-full rounded-chip bg-gris-fondo" />
      <div className="mt-1.5 h-3.5 w-2/3 rounded-chip bg-gris-fondo" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-5 w-16 rounded-chip bg-gris-fondo" />
        <div className="size-10 rounded-chip bg-gris-fondo sm:w-24 sm:rounded-xl" />
      </div>
      <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-pico-blanco/70 to-transparent motion-safe:animate-brillo" />
    </div>
  );
}

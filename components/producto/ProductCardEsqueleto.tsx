/** Estado de carga con la misma forma que ProductCard. */
export default function ProductCardEsqueleto() {
  return (
    <div
      className="flex h-full animate-pulse flex-col gap-2 rounded-tarjeta border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta"
      aria-hidden
    >
      <div className="mb-2 aspect-square rounded-boton bg-gris-fondo" />
      <div className="h-3 w-1/3 rounded bg-gris-fondo" />
      <div className="h-4 w-full rounded bg-gris-fondo" />
      <div className="h-4 w-2/3 rounded bg-gris-fondo" />
      <div className="mt-1 h-5 w-1/2 rounded bg-gris-fondo" />
      <div className="mt-2 h-10 rounded-boton bg-gris-fondo" />
    </div>
  );
}

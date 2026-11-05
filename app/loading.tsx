import Contenedor from "@/components/ui/Contenedor";

/**
 * Estado "cargando" de las páginas que no tienen uno propio (el inicio, el buscador, la cuenta): sale en el mismo toque
 * mientras el servidor arma la página. Categoría, producto y calculadoras tienen el suyo.
 */
export default function Cargando() {
  return (
    <Contenedor className="pt-4 pb-10 md:pt-6">
      <div className="animate-pulse space-y-6" aria-hidden>
        <div className="h-44 rounded-banner bg-gris-borde md:h-72" />
        <div className="h-6 w-56 rounded bg-gris-borde" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`aspect-[3/4] rounded-tarjeta bg-gris-borde ${i > 1 ? "hidden sm:block" : ""} ${i > 2 ? "sm:hidden lg:block" : ""}`} />
          ))}
        </div>
      </div>
      <p className="sr-only" role="status">
        Cargando…
      </p>
    </Contenedor>
  );
}

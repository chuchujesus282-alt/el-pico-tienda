import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando" del listado: misma distribución, con esqueletos. */
export default function CargandoCalculadoras() {
  return (
    <Contenedor className="space-y-8 py-6 md:space-y-10 md:py-8">
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-4 w-40 rounded bg-gris-borde" />
        <div className="h-64 rounded-banner bg-gris-borde md:h-80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-tarjeta bg-gris-borde" />
        ))}
      </div>
      <p className="sr-only" role="status">
        Cargando calculadoras…
      </p>
    </Contenedor>
  );
}

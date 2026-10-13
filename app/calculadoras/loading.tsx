import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando" del listado: misma distribución, con esqueletos. */
export default function CargandoCalculadoras() {
  return (
    <>
      <div className="h-72 animate-pulse bg-pico-azul md:h-80" aria-hidden />
    <Contenedor className="space-y-8 py-8 md:space-y-10 md:py-12">
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-tarjeta bg-gris-borde" />
        ))}
      </div>
      <p className="sr-only" role="status">
        Cargando calculadoras…
      </p>
    </Contenedor>
    </>
  );
}

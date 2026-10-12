import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando": misma distribución que la página de producto. */
export default function CargandoProducto() {
  return (
    <Contenedor className="py-6 md:py-8">
      <div className="animate-pulse" aria-hidden>
        <div className="h-4 w-56 rounded bg-gris-borde" />
        <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="aspect-square rounded-banner bg-gris-borde" />
          <div className="flex flex-col gap-4">
            <div className="h-3 w-40 rounded bg-gris-borde" />
            <div className="h-8 w-full rounded bg-gris-borde" />
            <div className="h-8 w-2/3 rounded bg-gris-borde" />
            <div className="mt-2 h-10 w-36 rounded bg-gris-borde" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-12 rounded-boton bg-gris-borde" />
              <div className="h-12 rounded-boton bg-gris-borde" />
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status">
        Cargando producto…
      </p>
    </Contenedor>
  );
}

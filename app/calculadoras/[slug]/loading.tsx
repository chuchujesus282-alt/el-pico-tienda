import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando" de una calculadora: formulario a la izquierda y resumen a la derecha, en esqueleto. */
export default function CargandoCalculadora() {
  return (
    <Contenedor className="py-6 md:py-8">
      <div className="animate-pulse" aria-hidden>
        <div className="h-4 w-56 rounded bg-gris-borde" />
        <div className="mt-5 flex items-center gap-4">
          <div className="size-14 rounded-tarjeta bg-gris-borde" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-gris-borde" />
            <div className="h-4 w-48 rounded bg-gris-borde" />
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="space-y-5">
            <div className="h-64 rounded-banner bg-gris-borde" />
            <div className="h-56 rounded-banner bg-gris-borde" />
            <div className="h-72 rounded-banner bg-gris-borde" />
          </div>
          <div className="hidden h-[32rem] rounded-banner bg-gris-borde lg:block" />
        </div>
      </div>
      <p className="sr-only" role="status">
        Cargando calculadora…
      </p>
    </Contenedor>
  );
}

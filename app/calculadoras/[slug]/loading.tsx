import Contenedor from "@/components/ui/Contenedor";

/** Estado "cargando" de una calculadora: formulario a la izquierda y resumen a la derecha, en esqueleto. */
export default function CargandoCalculadora() {
  return (
    <>
      <div className="h-40 animate-pulse bg-pico-azul md:h-52" aria-hidden />
    <Contenedor className="py-6 md:py-10">
      <div className="animate-pulse" aria-hidden>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
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
    </>
  );
}

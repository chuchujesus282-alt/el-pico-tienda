import type { Metadata } from "next";
import { ICONOS_PICO } from "@/components/icons/pico";
import PlacaIcono from "@/components/icons/pico/PlacaIcono";
import Plano from "@/components/icons/pico/Plano";
import Contenedor from "@/components/ui/Contenedor";

// Página interna para revisar el set de íconos propios. No está enlazada en ningún lado y no se indexa.

export const metadata: Metadata = { title: "Íconos (revisión)", robots: { index: false, follow: false } };

const grupos = [...new Set(ICONOS_PICO.map((i) => i.grupo))];

export default function PaginaIconos() {
  return (
    <Contenedor className="py-8 md:py-12">
      <h1 className="text-3xl font-bold text-pico-azul">Íconos de El Pico</h1>
      <p className="mt-2 max-w-2xl text-gris-texto">
        {ICONOS_PICO.length} íconos en grilla de 32×32, trazo de 1.75 y un acento rojo. Cada fila: 20 / 32 / 48 px, la placa en reposo
        (pasa el mouse para ver su animación) y la placa elegida.
      </p>

      {grupos.map((grupo) => (
        <section key={grupo} className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-pico-azul">{grupo}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ICONOS_PICO.filter((i) => i.grupo === grupo).map(({ nombre, descripcion, Componente }) => (
              <li key={nombre} className="grupo-icono rounded-2xl border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta">
                <div className="flex items-center gap-4 text-pico-azul">
                  <Componente className="size-5" />
                  <Componente className="size-8" />
                  <Componente className="size-12" />
                  <span className="mx-1 h-10 w-px bg-gris-borde" aria-hidden />
                  <PlacaIcono>
                    <Componente />
                  </PlacaIcono>
                  <PlacaIcono activo>
                    <Componente />
                  </PlacaIcono>
                </div>
                <p className="mt-3 font-bold text-pico-azul">{nombre}</p>
                <p className="text-[13px] leading-snug text-gris-texto">{descripcion}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-pico-azul">Ilustraciones tipo plano (banners y encabezados)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ICONOS_PICO.filter((i) => ["Categorías", "Calculadoras"].includes(i.grupo)).map(({ nombre, Componente }) => (
            <div key={nombre} className="grupo-icono overflow-hidden rounded-2xl bg-gradient-to-br from-pico-azul to-pico-azul-oscuro p-6">
              <Plano Icono={Componente} className="mx-auto w-48" />
              <p className="mt-2 text-center text-sm font-semibold text-pico-blanco/80">{nombre}</p>
            </div>
          ))}
        </div>
      </section>
    </Contenedor>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, MapPin, Route, Store } from "lucide-react";
import AccionesUbicacion from "@/components/ubicanos/AccionesUbicacion";
import MapaTienda from "@/components/ubicanos/MapaTienda";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { TIENDA } from "@/lib/tienda";

// Ubícanos — responsable: persona A (rama `ubicanos`). Los datos de la tienda están en lib/tienda.ts.

export const metadata: Metadata = {
  title: "Ubícanos",
  description: `Visítanos en ${TIENDA.direccion.join(", ")}, ${TIENDA.ciudad}. Ábrelo en Google Maps, Waze o Apple Maps.`,
};

/** Datos estructurados para que Google muestre la tienda con su ubicación. */
const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: TIENDA.nombre,
  address: {
    "@type": "PostalAddress",
    streetAddress: TIENDA.direccion.join(", "),
    addressLocality: "Caracas",
    addressRegion: "Miranda",
    postalCode: "1073",
    addressCountry: "VE",
  },
  geo: { "@type": "GeoCoordinates", latitude: TIENDA.latitud, longitude: TIENDA.longitud },
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(TIENDA.nombre)}&query_place_id=${TIENDA.googlePlaceId}`,
};

function Tarjeta({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-6">
      <h2 className="flex items-center gap-3 text-lg font-bold text-pico-azul">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">{icono}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function PaginaUbicanos() {
  return (
    <Contenedor className="space-y-6 py-6 md:space-y-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }}
      />

      <div className="motion-safe:animate-aparecer">
        <TituloSeccion titulo="Ubícanos" nivel="h1" className="mb-2" />
        <p className="max-w-2xl text-sm text-gris-texto md:text-base">
          Estamos en Fila de Mariches, en la carretera Petare–Santa Lucía. Toca el mapa para abrir la ruta en Google Maps,
          Waze o Apple Maps.
        </p>
      </div>

      <MapaTienda />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Tarjeta icono={<MapPin className="size-5" aria-hidden />} titulo="Dirección">
          <address className="text-base leading-relaxed text-texto not-italic">
            <strong className="block font-semibold">{TIENDA.nombre}</strong>
            {TIENDA.direccion.map((linea) => (
              <span key={linea} className="block">
                {linea}
              </span>
            ))}
            <span className="block">{TIENDA.ciudad}</span>
          </address>
          <p className="text-[13px] text-gris-texto">
            Código Plus:{" "}
            <span className="rounded-boton bg-gris-fondo px-1.5 py-0.5 font-mono font-semibold text-texto">{TIENDA.codigoPlus}</span>{" "}
            (escríbelo en cualquier app de mapas)
          </p>
          <div className="mt-auto pt-2">
            <AccionesUbicacion />
          </div>
        </Tarjeta>

        <Tarjeta icono={<Route className="size-5" aria-hidden />} titulo="Cómo llegar">
          <p className="text-sm leading-relaxed text-texto">
            Desde Petare, toma la carretera Petare–Santa Lucía en dirección a Mariches. Estamos en el{" "}
            <strong>kilómetro 6</strong>, en el sector <strong>El Limoncito</strong> de Fila de Mariches.
          </p>
          <p className="text-[13px] text-gris-texto">
            Si vienes en carro, Waze te lleva directo hasta la puerta.
          </p>
        </Tarjeta>

        <Tarjeta icono={<Store className="size-5" aria-hidden />} titulo="Retira tu pedido aquí">
          <p className="text-sm leading-relaxed text-texto">
            Arma tu pedido en la web y envíalo por WhatsApp. Te confirmamos disponibilidad y forma de pago, y lo pasas buscando
            por la tienda.
          </p>
          <Link
            href="/"
            className="group mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-pico-rojo hover:underline"
          >
            Ver productos
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </Link>
        </Tarjeta>
      </div>
    </Contenedor>
  );
}

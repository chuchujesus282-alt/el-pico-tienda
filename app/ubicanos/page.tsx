import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AccionesUbicacion from "@/components/ubicanos/AccionesUbicacion";
import MapaTienda from "@/components/ubicanos/MapaTienda";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import { TIENDA } from "@/lib/tienda";
import IconoUbicacion from "@/components/icons/pico/IconoUbicacion";
import IconoRuta from "@/components/icons/pico/IconoRuta";
import IconoTienda from "@/components/icons/pico/IconoTienda";

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

export default function PaginaUbicanos() {
  return (
    <>
      <EncabezadoPagina
        titulo="Ubícanos"
        descripcion="Estamos en Fila de Mariches, en la carretera Petare–Santa Lucía. Toca el mapa para abrir la ruta en Google Maps, Waze o Apple Maps."
        ruta={[{ texto: "Ubícanos" }]}
        icono={IconoUbicacion}
      />
    <Contenedor className="space-y-6 py-6 md:space-y-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }}
      />

      <MapaTienda />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <TarjetaInfo icono={<IconoUbicacion className="size-6" />} titulo="Dirección">
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
        </TarjetaInfo>

        <TarjetaInfo icono={<IconoRuta className="size-6" />} titulo="Cómo llegar">
          <p className="text-sm leading-relaxed text-texto">
            Desde Petare, toma la carretera Petare–Santa Lucía en dirección a Mariches. Estamos en el{" "}
            <strong>kilómetro 6</strong>, en el sector <strong>El Limoncito</strong> de Fila de Mariches.
          </p>
          <p className="text-[13px] text-gris-texto">
            Si vienes en carro, Waze te lleva directo hasta la puerta.
          </p>
        </TarjetaInfo>

        <TarjetaInfo icono={<IconoTienda className="size-6" />} titulo="Retira tu pedido aquí">
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
        </TarjetaInfo>
      </div>
    </Contenedor>
    </>
  );
}

import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { FileText, MapPin, Zap } from "lucide-react";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import { Montanas } from "@/components/layout/Logo";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

/** Para qué sirve tener cuenta: lo que el cliente gana, en una línea cada uno. */
const beneficios: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Zap, titulo: "Compras más rápido", texto: "Tus datos se llenan solos al hacer el pedido." },
  { icono: FileText, titulo: "Factura a tu nombre", texto: "Guardamos tu cédula o RIF y tu dirección fiscal." },
  { icono: MapPin, titulo: "Tus direcciones a mano", texto: "Para el delivery o el flete, sin escribirlas otra vez." },
];

export default function PaginaIniciarSesion() {
  return (
    <>
      <EncabezadoPagina ruta={[{ texto: "Iniciar sesión" }]} />
      <Contenedor className="py-6 md:py-10">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta md:grid-cols-[1fr_1.15fr] motion-safe:animate-aparecer">
          {/* Panel de marca: solo desde tablet; en el teléfono va directo al formulario. */}
          <aside className="relative hidden flex-col justify-center gap-10 overflow-hidden bg-pico-azul p-10 text-pico-blanco md:flex lg:p-12">
            <Montanas className="pointer-events-none absolute -right-16 -bottom-10 w-80 fill-pico-blanco opacity-[0.06]" />

            <div className="relative">
              <span className="mb-4 block h-1 w-12 rounded-sm bg-pico-rojo" aria-hidden />
              <p className="text-2xl leading-tight font-bold lg:text-3xl">Tu cuenta en El Pico</p>
              <p className="mt-2 text-sm text-pico-blanco/70">Todo lo de tu ferretería, más a la mano.</p>
            </div>

            <ul className="relative space-y-5">
              {beneficios.map(({ icono: Icono, titulo, texto }) => (
                <li key={titulo} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-chip bg-pico-blanco/10 text-pico-blanco">
                    <Icono className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{titulo}</span>
                    <span className="block text-[13px] text-pico-blanco/70">{texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:px-14 lg:py-12">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="text-2xl font-bold text-pico-azul md:text-3xl">Inicia sesión</h1>
              <p className="mt-1 mb-7 text-sm text-gris-texto">Entra a tu cuenta para comprar más rápido.</p>

              <FormularioInicioSesion />

              <div className="mt-8 flex flex-col gap-3 border-t border-gris-borde pt-6 text-center">
                <p className="text-sm text-gris-texto">¿No tienes cuenta?</p>
                <Boton href="/crear-cuenta" variante="secundario" anchoCompleto className="h-11">
                  Crear cuenta
                </Boton>
              </div>
            </div>
          </div>
        </div>
      </Contenedor>
    </>
  );
}

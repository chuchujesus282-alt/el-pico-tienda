import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import FormularioInicioSesion from "@/components/cuenta/FormularioInicioSesion";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
import IconoTienda from "@/components/icons/pico/IconoTienda";
import IconoUbicacion from "@/components/icons/pico/IconoUbicacion";
import Plano from "@/components/icons/pico/Plano";
import { Montanas } from "@/components/layout/Logo";

// Inicio de sesión — responsable: persona A (rama `inicio-sesion`).
// Pantalla completa (sin header, footer ni barra inferior: ver components/layout/pantallaCompleta.ts).
// Desde 1024px, pantalla dividida: panel azul marino con el logo, un plano y lo que ganas con tu cuenta;
// el formulario a la derecha. En el teléfono, solo el formulario con el logo arriba.

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

const beneficios = [
  { Icono: IconoUbicacion, texto: "Guarda tus direcciones de entrega en el mapa." },
  { Icono: IconoMensaje, texto: "Arma tu pedido y envíalo por WhatsApp en un clic." },
  { Icono: IconoCorazon, texto: "Tus favoritos, listos para cuando los necesites." },
];

export default function PaginaIniciarSesion() {
  return (
    <div className="grid min-h-dvh bg-pico-blanco lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Panel de marca (solo desde 1024px). */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro p-10 text-pico-blanco lg:flex lg:flex-col xl:p-14">
        <Link href="/" className="inline-flex items-center gap-3 self-start rounded-boton focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pico-blanco">
          <Montanas className="h-9 w-auto fill-pico-rojo" />
          <span className="leading-none">
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-pico-blanco/70 uppercase">Centro ferretero</span>
            <span className="block text-2xl font-bold tracking-wide uppercase">El Pico</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-md py-10">
          <span className="block h-1 w-12 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
          <p className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-balance xl:text-5xl">Tu ferretería de confianza, ahora a un clic.</p>
          <ul className="mt-8 space-y-4">
            {beneficios.map(({ Icono, texto }, i) => (
              <li
                key={texto}
                className="grupo-icono flex items-center gap-3.5 text-[15px] text-pico-blanco/85 motion-safe:animate-aparecer"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pico-blanco/10 ring-1 ring-pico-blanco/15 ring-inset">
                  <Icono className="size-7" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        {/* Plano técnico de la tienda, de adorno abajo a la derecha. */}
        <span className="grupo-icono pointer-events-none absolute -right-20 -bottom-28 opacity-45" aria-hidden>
          <Plano Icono={IconoTienda} medidas={["8.40 m", "6.00 m"]} className="w-80 xl:w-96" />
        </span>
        <p className="relative text-xs text-pico-blanco/50">Caracas · Venezuela</p>
      </aside>

      {/* Formulario. */}
      <div className="flex min-h-dvh flex-col px-[var(--margen-pagina)] pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-12 lg:px-12 xl:px-20">
        <Link
          href="/"
          className="area-tactil inline-flex items-center gap-1 self-start text-[15px] font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Volver a la tienda
        </Link>

        {/* my-auto: el formulario queda centrado en la pantalla, con aire arriba en pantallas bajas. */}
        <div className="mx-auto my-auto w-full max-w-lg pt-8 text-center motion-safe:animate-aparecer">
          <Montanas className="mx-auto h-16 w-auto fill-pico-rojo motion-safe:animate-caer md:h-20 lg:hidden" />
          <h1 className="mt-7 text-4xl font-bold tracking-tight text-pico-azul md:text-5xl lg:mt-0">Bienvenido</h1>
          <p className="mt-4 text-base text-gris-texto">
            ¿No tienes cuenta?{" "}
            <Link href="/crear-cuenta" className="font-semibold text-pico-rojo underline underline-offset-4 hover:text-pico-rojo-oscuro">
              Crear cuenta
            </Link>
          </p>

          <div className="mt-10 text-left">
            <FormularioInicioSesion />
          </div>
        </div>
      </div>
    </div>
  );
}

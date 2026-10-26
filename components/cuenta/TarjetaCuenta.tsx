"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, KeyRound } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useFavoritos } from "@/components/favoritos/almacenFavoritos";
import IconoCarrito from "@/components/icons/pico/IconoCarrito";
import IconoCorazon from "@/components/icons/pico/IconoCorazon";
import IconoUbicacion from "@/components/icons/pico/IconoUbicacion";
import { authCliente } from "@/lib/authCliente";
import FotoCuenta from "./FotoCuenta";

/** Columna de /mi-cuenta: quién eres, atajos a lo tuyo (con cuántos tienes) y cerrar sesión. */
export default function TarjetaCuenta({ nombre, correo }: { nombre: string; correo: string }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const { cantidadTotal } = useCarrito();
  const { cantidad: cantidadFavoritos } = useFavoritos();

  const atajos = [
    { href: "/favoritos", Icono: IconoCorazon, texto: "Mis favoritos", detalle: cantidadFavoritos ? `${cantidadFavoritos} guardados` : "Aún no tienes" },
    { href: "/carrito", Icono: IconoCarrito, texto: "Mi carrito", detalle: cantidadTotal ? `${cantidadTotal} productos` : "Vacío" },
    { href: "/mis-direcciones", Icono: IconoUbicacion, texto: "Mis direcciones", detalle: "Dónde recibes tus pedidos" },
  ];

  const salir = async () => {
    setSaliendo(true);
    await authCliente.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-tarjeta bg-pico-blanco p-5 shadow-tarjeta">
        <FotoCuenta className="size-14 shrink-0 text-lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-pico-azul">{nombre}</p>
          <p className="truncate text-sm text-gris-texto">{correo}</p>
        </div>
      </div>

      <nav aria-label="Lo tuyo" className="overflow-hidden rounded-tarjeta bg-pico-blanco shadow-tarjeta">
        <ul className="divide-y divide-gris-borde">
          {atajos.map(({ href, Icono, texto, detalle }) => (
            <li key={href}>
              <Link href={href} className="grupo-icono group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-pico-azul-claro">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul">
                  <Icono className="size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-pico-azul">{texto}</span>
                  <span className="block text-[13px] text-gris-texto">{detalle}</span>
                </span>
                <ChevronRight className="size-5 text-gris-texto transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/recuperar-contrasena" className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-pico-azul-claro">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul">
                <KeyRound className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-pico-azul">Cambiar mi contraseña</span>
                <span className="block text-[13px] text-gris-texto">Te enviamos un enlace por correo</span>
              </span>
              <ChevronRight className="size-5 text-gris-texto transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        onClick={salir}
        disabled={saliendo}
        className="h-12 cursor-pointer rounded-boton border-2 border-gris-borde bg-pico-blanco text-[15px] font-semibold text-pico-azul transition hover:border-pico-azul hover:shadow-tarjeta-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saliendo ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import type { ProveedorSocial } from "@/types/cuenta";

const PROVEEDORES: { id: ProveedorSocial; nombre: string; logo: string }[] = [
  { id: "google", nombre: "Google", logo: "/google.svg" },
  { id: "facebook", nombre: "Facebook", logo: "/facebook.svg" },
  { id: "apple", nombre: "Apple", logo: "/apple.svg" },
];

type Props = {
  onElegir: (proveedor: ProveedorSocial) => void;
  disabled?: boolean;
};

/** Fila de botones redondos para entrar con Google, Facebook o Apple (cada logo con sus colores oficiales). */
export default function BotonesSociales({ onElegir, disabled }: Props) {
  return (
    <ul className="flex justify-center gap-5">
      {PROVEEDORES.map(({ id, nombre, logo }) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => onElegir(id)}
            disabled={disabled}
            aria-label={`Continuar con ${nombre}`}
            title={`Continuar con ${nombre}`}
            className="flex size-16 cursor-pointer items-center justify-center rounded-chip border-2 border-gris-borde bg-pico-blanco transition hover:border-pico-azul hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image src={logo} alt="" width={30} height={30} />
          </button>
        </li>
      ))}
    </ul>
  );
}

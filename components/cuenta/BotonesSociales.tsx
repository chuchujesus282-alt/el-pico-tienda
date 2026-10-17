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
  /** Retraso (ms) para que los tres entren en cascada; sin él, aparecen de una vez. */
  cascada?: number;
};

/** Fila de botones redondos para entrar con Google, Facebook o Apple (cada logo con sus colores oficiales). */
export default function BotonesSociales({ onElegir, disabled, cascada }: Props) {
  return (
    <ul className="flex justify-center gap-5">
      {PROVEEDORES.map(({ id, nombre, logo }, i) => (
        <li
          key={id}
          className={cascada === undefined ? undefined : "motion-safe:animate-aparecer"}
          style={cascada === undefined ? undefined : { animationDelay: `${cascada + i * 70}ms` }}
        >
          <button
            type="button"
            onClick={() => onElegir(id)}
            disabled={disabled}
            aria-label={`Continuar con ${nombre}`}
            title={`Continuar con ${nombre}`}
            className="flex size-16 cursor-pointer items-center justify-center rounded-chip border-2 border-gris-borde bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-pico-azul hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image src={logo} alt="" width={30} height={30} />
          </button>
        </li>
      ))}
    </ul>
  );
}

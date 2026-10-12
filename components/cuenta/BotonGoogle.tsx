"use client";

import Image from "next/image";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

/** Botón "Continuar con Google": blanco con el logo de Google, como lo pide su guía de marca. */
export default function BotonGoogle({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-boton border border-gris-borde bg-pico-blanco px-4 text-sm font-semibold text-texto transition-colors hover:border-pico-azul/40 hover:bg-gris-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Image src="/google.svg" alt="" width={20} height={20} />
      Continuar con Google
    </button>
  );
}

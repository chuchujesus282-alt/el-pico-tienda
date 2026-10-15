"use client";

import Image from "next/image";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

/** "Continuar con Google": el logo de Google en un círculo blanco con borde, como en la guía de marca de Google. */
export default function BotonGoogle({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Continuar con Google"
      title="Continuar con Google"
      className="flex size-14 items-center justify-center rounded-chip border-2 border-gris-borde bg-pico-blanco transition hover:border-pico-azul hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Image src="/google.svg" alt="" width={26} height={26} />
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type Props = {
  codigo: string;
  titulo: string;
};

type Aviso = "codigo" | "enlace" | null;

const claseBoton =
  "inline-flex items-center gap-1.5 rounded-chip border border-gris-borde bg-pico-blanco px-2.5 py-1 text-xs font-semibold text-logo-marino transition-colors hover:border-logo-marino hover:bg-logo-marino-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino";

/** Código del producto con botón para copiarlo (útil para pedir por WhatsApp) y botón para compartir. */
export default function CodigoCompartir({ codigo, titulo }: Props) {
  const [aviso, setAviso] = useState<Aviso>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 1500);
    return () => clearTimeout(t);
  }, [aviso]);

  const copiar = async (texto: string, tipo: Exclude<Aviso, null>) => {
    try {
      await navigator.clipboard.writeText(texto);
      setAviso(tipo);
    } catch {
      // Sin permiso de portapapeles: no hacemos nada.
    }
  };

  const compartir = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: `${titulo} en El Pico`, url });
      } catch {
        // El cliente canceló.
      }
      return;
    }
    copiar(url, "enlace");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => copiar(codigo, "codigo")} className={claseBoton} aria-label={`Copiar código ${codigo}`}>
        {aviso === "codigo" ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        {aviso === "codigo" ? "¡Copiado!" : `Cód. ${codigo}`}
      </button>
      <button type="button" onClick={compartir} className={claseBoton}>
        {aviso === "enlace" ? <Check className="size-3.5" aria-hidden /> : <Share2 className="size-3.5" aria-hidden />}
        {aviso === "enlace" ? "Enlace copiado" : "Compartir"}
      </button>
    </div>
  );
}

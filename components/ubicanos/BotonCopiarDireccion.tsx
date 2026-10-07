"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { TIENDA } from "@/lib/tienda";

/** Copia la dirección completa para pegarla en un chat o en otra app. */
export default function BotonCopiarDireccion({ anchoCompleto = false }: { anchoCompleto?: boolean }) {
  const [estado, setEstado] = useState<"listo" | "copiado" | "error">("listo");

  useEffect(() => {
    if (estado === "listo") return;
    const t = setTimeout(() => setEstado("listo"), 2000);
    return () => clearTimeout(t);
  }, [estado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(TIENDA.direccionCompleta);
      setEstado("copiado");
    } catch {
      setEstado("error"); // sin permiso de portapapeles: la dirección sigue escrita en la página
    }
  };

  return (
    <Boton variante="secundario" onClick={copiar} anchoCompleto={anchoCompleto} className="cursor-pointer" aria-live="polite">
      {estado === "copiado" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {estado === "copiado" ? "¡Dirección copiada!" : estado === "error" ? "No se pudo copiar" : "Copiar dirección"}
    </Boton>
  );
}

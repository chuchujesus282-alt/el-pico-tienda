"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Navigation, Share2 } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { APPS_MAPAS, TIENDA } from "@/lib/tienda";
import BotonCopiarDireccion from "./BotonCopiarDireccion";
import SelectorMapas from "./SelectorMapas";

const sinSuscripcion = () => () => {};
const puedeCompartir = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Botones debajo de la dirección: abrir en una app de mapas, copiar la dirección y compartirla (si el teléfono lo permite). */
export default function AccionesUbicacion() {
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);
  const compartible = useSyncExternalStore(sinSuscripcion, puedeCompartir, () => false);

  const compartir = async () => {
    try {
      await navigator.share({ title: TIENDA.nombre, text: TIENDA.direccionCompleta, url: APPS_MAPAS[0].href });
    } catch {
      // El cliente canceló o el navegador no lo permitió: no pasa nada.
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Boton onClick={() => setAbierto(true)} className="cursor-pointer" aria-haspopup="dialog">
        <Navigation className="size-4" aria-hidden />
        Cómo llegar
      </Boton>
      <BotonCopiarDireccion />
      {compartible && (
        <Boton variante="secundario" onClick={compartir} className="cursor-pointer">
          <Share2 className="size-4" aria-hidden />
          Compartir
        </Boton>
      )}
      <SelectorMapas abierto={abierto} cerrar={cerrar} />
    </div>
  );
}

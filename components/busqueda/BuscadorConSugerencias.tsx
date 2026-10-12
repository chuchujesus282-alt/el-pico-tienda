"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { tituloProducto } from "@/lib/formato";
import { sugerirCorrigiendo } from "@/lib/recomendaciones/busqueda";
import type { IndiceBusqueda } from "@/lib/recomendaciones/busqueda";
import type { Producto } from "@/types/catalogo";
import { cargarIndice } from "./indiceCliente";

const ESPERA_MS = 150; // debounce: se busca cuando el cliente deja de escribir
const MAXIMO = 6;

/**
 * Caja de búsqueda del header con sugerencias en vivo (búsqueda inteligente de lib/recomendaciones/).
 * Enter sin elegir sugerencia → página /buscar?q=… con todos los resultados.
 */
export default function BuscadorConSugerencias({ className = "" }: { className?: string }) {
  const router = useRouter();
  const idLista = useId();
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState<IndiceBusqueda | null>(null);
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [correccion, setCorreccion] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const contenedor = useRef<HTMLFormElement>(null);

  const consulta = texto.trim();

  useEffect(() => {
    const espera = setTimeout(() => {
      const resultado =
        indice && consulta.length >= 2 ? sugerirCorrigiendo(indice, consulta, MAXIMO) : { productos: [], correccion: null };
      setSugerencias(resultado.productos);
      setCorreccion(resultado.correccion);
      setActivo(-1);
    }, ESPERA_MS);
    return () => clearTimeout(espera);
  }, [indice, consulta]);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", alClic);
    return () => document.removeEventListener("pointerdown", alClic);
  }, [abierto]);

  const prepararIndice = () => {
    setAbierto(true);
    if (!indice) cargarIndice().then((i) => i && setIndice(i));
  };

  const mostrarLista = abierto && consulta.length >= 2 && indice !== null;
  const enlaceTodos = `/buscar?q=${encodeURIComponent(consulta)}`;

  const alTeclear = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setAbierto(false);
      return;
    }
    if (!mostrarLista || !sugerencias.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      // -1 = ninguna elegida (Enter busca lo escrito); al pasar del final vuelve al texto.
      const siguiente = activo + (e.key === "ArrowDown" ? 1 : -1);
      setActivo(siguiente >= sugerencias.length ? -1 : siguiente < -1 ? sugerencias.length - 1 : siguiente);
    }
    if (e.key === "Enter" && activo >= 0 && activo < sugerencias.length) {
      e.preventDefault();
      setAbierto(false);
      router.push(`/producto/${sugerencias[activo].id}`);
    }
  };

  return (
    <form
      ref={contenedor}
      action="/buscar"
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        if (!consulta) e.preventDefault();
        setAbierto(false);
      }}
    >
      <label htmlFor="buscador" className="sr-only">
        Buscar productos
      </label>
      <div className="group flex h-12 items-center rounded-chip border-2 border-pico-azul bg-pico-blanco pr-1 pl-5 transition-shadow focus-within:shadow-tarjeta-hover focus-within:ring-4 focus-within:ring-pico-azul-claro">
        <Search
          className="mr-2 size-4 shrink-0 text-gris-texto transition-colors group-focus-within:text-pico-azul"
          aria-hidden
        />
        <input
          id="buscador"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="¿Qué estás buscando? Ej. cemento, taladro…"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
          }}
          onFocus={prepararIndice}
          onKeyDown={alTeclear}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-activedescendant={mostrarLista && activo >= 0 ? `${idLista}-${activo}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-texto outline-none placeholder:text-gris-texto"
        />
        <button
          type="submit"
          className="group/buscar flex h-9 cursor-pointer items-center justify-center gap-2 rounded-chip bg-pico-azul px-3 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:px-5"
        >
          <Search
            className="size-4 transition-transform duration-300 motion-safe:group-hover/buscar:scale-110 motion-safe:group-hover/buscar:-rotate-12"
            aria-hidden
          />
          <span className="sr-only md:not-sr-only">Buscar</span>
        </button>
      </div>

      {mostrarLista && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer">
          <ul id={idLista} role="listbox" aria-label="Sugerencias" className="max-h-[70vh] overflow-y-auto py-1">
            {correccion && (
              <li className="px-4 pt-2.5 pb-1 text-[13px] text-gris-texto" role="presentation">
                Mostrando resultados para <strong className="font-semibold text-pico-azul">{correccion}</strong>
              </li>
            )}
            {sugerencias.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-gris-texto">
                No vemos coincidencias exactas. Presiona Enter para ver opciones parecidas.
              </li>
            )}
            {sugerencias.map((producto, i) => (
              <li key={producto.id} id={`${idLista}-${i}`} role="option" aria-selected={i === activo}>
                <Link
                  href={`/producto/${producto.id}`}
                  onClick={() => setAbierto(false)}
                  onMouseEnter={() => setActivo(i)}
                  className={`flex items-center gap-3 px-4 py-2 transition-colors ${i === activo ? "bg-pico-azul-claro" : "hover:bg-gris-fondo"}`}
                >
                  <ImagenProducto
                    src={producto.imagen}
                    alt=""
                    sizes="40px"
                    className="size-10 shrink-0 rounded-boton border border-gris-borde"
                  />
                  <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-texto">{tituloProducto(producto)}</span>
                  <Precio valor={producto.precio} tamano="pequeno" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={enlaceTodos}
            onClick={() => setAbierto(false)}
            className="group/todos flex items-center justify-between gap-2 border-t border-gris-borde bg-gris-fondo px-4 py-3 text-sm font-semibold text-pico-azul hover:text-pico-rojo"
          >
            Ver todos los resultados de “{consulta}”
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover/todos:translate-x-1" aria-hidden />
          </Link>
        </div>
      )}
    </form>
  );
}

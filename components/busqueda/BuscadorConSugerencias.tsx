"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { descripcionProducto, tituloProducto } from "@/lib/formato";
import type { ProductoSugerido, RespuestaSugerencias } from "@/lib/busquedaServidor";

const ESPERA_MS = 150; // debounce: se pregunta al servidor cuando el cliente deja de escribir
/** Si el índice del servidor todavía se está armando, se pregunta una vez más pasado este tiempo. */
const REINTENTO_MS = 1500;

/**
 * Caja de búsqueda del header con sugerencias en vivo (búsqueda inteligente de lib/recomendaciones/). Las sugerencias
 * las calcula el servidor (GET /api/sugerencias?q=…, con el índice de lib/indiceServidor.ts): el navegador ya no
 * descarga el catálogo. Enter sin elegir sugerencia → página /buscar?q=… con todos los resultados.
 */
export default function BuscadorConSugerencias({ className = "" }: { className?: string }) {
  const router = useRouter();
  const idLista = useId();
  const [texto, setTexto] = useState("");
  // null: todavía no hay respuesta (o el índice del servidor no estaba listo): no se muestra la lista.
  const [resultado, setResultado] = useState<{ productos: ProductoSugerido[]; correccion: string | null } | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const contenedor = useRef<HTMLFormElement>(null);
  const preparado = useRef(false);

  const consulta = texto.trim();
  const sugerencias = resultado?.productos ?? [];
  const correccion = resultado?.correccion ?? null;

  useEffect(() => {
    if (consulta.length < 2) return;
    // Cada letra cancela la consulta anterior: solo cuenta la respuesta de lo último que se escribió.
    const control = new AbortController();
    let reintento: ReturnType<typeof setTimeout> | undefined;
    const pedir = (intento: number) =>
      fetch(`/api/sugerencias?q=${encodeURIComponent(consulta)}`, { signal: control.signal })
        .then((r) => (r.ok ? (r.json() as Promise<RespuestaSugerencias>) : Promise.reject(new Error("sin sugerencias"))))
        .then((datos) => {
          if (!datos.listo) {
            if (intento === 0) reintento = setTimeout(() => pedir(1), REINTENTO_MS);
            return;
          }
          setResultado({ productos: datos.productos, correccion: datos.correccion });
          setActivo(-1);
        })
        .catch(() => {
          // Cancelada o sin conexión: Enter sigue llevando a /buscar.
        });
    const espera = setTimeout(() => pedir(0), ESPERA_MS);
    return () => {
      clearTimeout(espera);
      clearTimeout(reintento);
      control.abort();
    };
  }, [consulta]);

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
    // Al tocar la caja, una consulta vacía (casi nada) le avisa al servidor que arme el índice si todavía no lo tiene:
    // así, cuando el cliente termine de escribir, las sugerencias ya están listas.
    if (preparado.current) return;
    preparado.current = true;
    fetch("/api/sugerencias?q=").catch(() => {});
  };

  const mostrarLista = abierto && consulta.length >= 2 && resultado !== null;
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
      <div className="group flex h-12 items-center rounded-chip border-2 border-pico-azul bg-pico-blanco pr-1 pl-5 transition-shadow duration-200 focus-within:shadow-tarjeta-hover focus-within:ring-4 focus-within:ring-pico-azul/20">
        <Search
          className="mr-2 size-4 shrink-0 text-gris-texto transition-colors group-focus-within:text-pico-azul"
          aria-hidden
        />
        <input
          id="buscador"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="¿Qué buscas? Ej. cemento, taladro…"
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
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-texto outline-none placeholder:text-gris-texto sm:text-[15px]"
        />
        <button
          type="submit"
          className="group/buscar area-tactil flex h-9 cursor-pointer items-center justify-center gap-2 rounded-chip bg-pico-azul px-3 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:px-5"
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
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium text-texto">{tituloProducto(producto)}</span>
                    {descripcionProducto(producto) && (
                      <span className="block truncate text-[13px] font-semibold text-pico-azul-medio">{descripcionProducto(producto)}</span>
                    )}
                  </span>
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

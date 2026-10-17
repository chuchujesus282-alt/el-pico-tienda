"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Check, HardHat, House, MapPinOff } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { LARGO_DESCRIPCION, LARGO_NOMBRE, MAXIMO_DIRECCIONES, validarDireccion, type ErroresDireccion } from "@/lib/direcciones";
import type { Direccion, Ubicacion } from "@/types/cliente";
import { useDirecciones } from "./almacenDirecciones";
import MapaElegirPunto from "./MapaElegirPunto";
import { PinMapa } from "./PinMapa";

/** Nombres frecuentes: un toque y listo (se pueden cambiar). */
const SUGERENCIAS = [
  { nombre: "Casa", Icono: House },
  { nombre: "Trabajo", Icono: Briefcase },
  { nombre: "Obra", Icono: HardHat },
  { nombre: "Oficina", Icono: Building2 },
];

const claseCampo =
  "w-full rounded-boton border bg-pico-blanco px-4 text-base text-texto outline-none transition-shadow placeholder:text-gris-texto focus:ring-4";
const bordes = (error?: string) =>
  error ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15" : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro";

type Props = {
  /** Id de la dirección a editar; sin él, es una nueva. */
  editarId?: string;
  /** Ruta interna a la que se vuelve al guardar (ej. /finalizar-pedido). */
  volver?: string;
};

/** Agregar o editar una dirección: una tarjeta con el mapa arriba y los datos debajo. */
export default function FormularioDireccion({ editarId, volver }: Props) {
  const { direcciones, listo, lleno } = useDirecciones();

  // Antes de leer el navegador no se sabe qué hay guardado: el mapa espera con su fondo.
  if (!listo) return <div className="h-[38rem] animate-pulse rounded-banner bg-pico-blanco shadow-tarjeta motion-reduce:animate-none" />;

  const existente = editarId ? direcciones.find((d) => d.id === editarId) : undefined;
  const salida = volver ?? "/mis-direcciones";

  if (editarId && !existente) {
    return (
      <Aviso titulo="Esa dirección ya no está" texto="Puede que la hayas borrado en otra pestaña." salida={salida} />
    );
  }
  if (!editarId && lleno) {
    return (
      <Aviso
        titulo={`Ya tienes ${MAXIMO_DIRECCIONES} direcciones`}
        texto="Borra una que ya no uses para agregar otra."
        salida="/mis-direcciones"
      />
    );
  }
  return <Formulario key={existente?.id ?? "nueva"} existente={existente} salida={salida} />;
}

function Aviso({ titulo, texto, salida }: { titulo: string; texto: string; salida: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-14 text-center shadow-tarjeta">
      <MapPinOff className="size-10 text-pico-azul" strokeWidth={1.5} aria-hidden />
      <h2 className="text-xl font-bold text-pico-azul">{titulo}</h2>
      <p className="max-w-sm text-gris-texto">{texto}</p>
      <Boton href={salida} variante="secundario" className="mt-2 h-11">
        Volver
      </Boton>
    </div>
  );
}

function Formulario({ existente, salida }: { existente?: Direccion; salida: string }) {
  const router = useRouter();
  const { guardar } = useDirecciones();
  const [nombre, setNombre] = useState(existente?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(existente?.descripcion ?? "");
  const [punto, setPunto] = useState<Ubicacion | null>(existente ?? null);
  // Cuántas veces se ajustó el punto: la línea de estado late cada vez.
  const [ajustes, setAjustes] = useState(0);
  const [errores, setErrores] = useState<ErroresDireccion>({});
  const [guardada, setGuardada] = useState(false);
  const alMover = useCallback((u: Ubicacion) => {
    setPunto(u);
    setAjustes((n) => n + 1);
  }, []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim(), ...(punto ?? { latitud: Number.NaN, longitud: Number.NaN }) };
    const nuevos = validarDireccion(datos);
    setErrores(nuevos);
    const primero = (["nombre", "descripcion"] as const).find((campo) => nuevos[campo]);
    if (primero) {
      document.getElementById(`direccion-${primero}`)?.focus();
      return;
    }
    if (nuevos.ubicacion) return;
    guardar({ ...datos, id: existente?.id });
    // Un instante de "¡Guardada!" con su ✓ antes de seguir (sin animaciones, sigue de una vez).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(salida);
    setGuardada(true);
    setTimeout(() => router.push(salida), 700);
  };

  const largo = descripcion.length;

  return (
    // Una sola tarjeta: el mapa arriba a todo el ancho y los datos debajo (nombre y descripción en dos
    // columnas desde tableta), con los botones cerrando la tarjeta abajo a la derecha.
    <form
      onSubmit={enviar}
      noValidate
      className="overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer"
    >
      <MapaElegirPunto inicial={existente ?? null} alMover={alMover} className="h-[46dvh] min-h-72 md:h-[26rem] lg:h-[30rem]" />

      <div className="flex flex-col border-t border-gris-borde">
        <div className="grid gap-6 p-5 md:grid-cols-2 md:gap-x-8 md:p-7">
          {/* Estado del punto: confirma que ya quedó marcado y late cada vez que se ajusta. */}
          <div className="flex items-center gap-3 rounded-tarjeta bg-pico-azul-claro px-4 py-3 motion-safe:animate-aparecer [animation-delay:120ms] md:col-span-2">
            <span key={ajustes} className="shrink-0 motion-safe:animate-latido">
              <PinMapa className="h-8" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-pico-azul">{punto ? "Punto marcado" : "Cargando el mapa…"}</span>
              <span className="block text-[13px] text-pico-azul/75">Mueve el mapa para ajustarlo a tu puerta.</span>
            </span>
          </div>

          <fieldset className="flex flex-col gap-3 motion-safe:animate-aparecer [animation-delay:200ms]">
            <legend className="mb-3 text-[15px] font-semibold text-pico-azul">¿Qué lugar es?</legend>
            <div className="grid grid-cols-4 gap-2">
              {SUGERENCIAS.map(({ nombre: s, Icono }) => {
                const marcada = nombre === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNombre(s)}
                    aria-pressed={marcada}
                    className={`group/sug flex h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-tarjeta border text-[13px] font-semibold transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-95 ${
                      marcada
                        ? "border-pico-azul bg-pico-azul text-pico-blanco shadow-boton-hover"
                        : "border-gris-borde bg-pico-blanco text-pico-azul hover:border-pico-azul/40 hover:bg-pico-azul-claro motion-safe:hover:-translate-y-0.5"
                    }`}
                  >
                    <Icono
                      key={marcada ? "si" : "no"}
                      className={`size-5 ${marcada ? "motion-safe:animate-latido" : "transition-transform duration-300 motion-safe:group-hover/sug:-translate-y-0.5"}`}
                      strokeWidth={marcada ? 2.25 : 1.75}
                      aria-hidden
                    />
                    {s}
                  </button>
                );
              })}
            </div>
            <label htmlFor="direccion-nombre" className="sr-only">
              Nombre de la dirección
            </label>
            <input
              id="direccion-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={LARGO_NOMBRE.maximo}
              placeholder="O escribe otro nombre"
              autoComplete="off"
              aria-invalid={errores.nombre ? true : undefined}
              aria-describedby={errores.nombre ? "direccion-nombre-error" : undefined}
              className={`${claseCampo} ${bordes(errores.nombre)} h-12`}
            />
            {errores.nombre && (
              <p id="direccion-nombre-error" className="-mt-1 text-[13px] text-pico-rojo">
                {errores.nombre}
              </p>
            )}
          </fieldset>

          <div className="flex flex-col gap-2 motion-safe:animate-aparecer [animation-delay:280ms]">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="direccion-descripcion" className="text-[15px] font-semibold text-pico-azul">
                ¿Cómo llega el repartidor?
              </label>
              <span className={`text-xs tabular-nums ${largo >= LARGO_DESCRIPCION.maximo ? "text-pico-rojo" : "text-gris-texto"}`} aria-hidden>
                {largo}/{LARGO_DESCRIPCION.maximo}
              </span>
            </div>
            <textarea
              id="direccion-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={LARGO_DESCRIPCION.maximo}
              rows={3}
              placeholder="Edificio o casa, piso y una referencia. Ej. Edif. Los Pinos, piso 4, frente a la panadería."
              aria-invalid={errores.descripcion ? true : undefined}
              aria-describedby={errores.descripcion ? "direccion-descripcion-error" : undefined}
              className={`${claseCampo} ${bordes(errores.descripcion)} resize-none py-3 leading-relaxed md:flex-1`}
            />
            {/* Barra que se llena mientras escribe: azul hasta tener lo mínimo útil, roja al tope. */}
            <span className="h-1 overflow-hidden rounded-chip bg-gris-fondo" aria-hidden>
              <span
                className={`block h-full rounded-chip transition-[width,background-color] duration-300 ease-out ${
                  largo >= LARGO_DESCRIPCION.maximo ? "bg-pico-rojo" : descripcion.trim().length >= LARGO_DESCRIPCION.minimo ? "bg-pico-azul" : "bg-pico-azul/35"
                }`}
                style={{ width: `${(largo / LARGO_DESCRIPCION.maximo) * 100}%` }}
              />
            </span>
            {errores.descripcion && (
              <p id="direccion-descripcion-error" className="text-[13px] text-pico-rojo">
                {errores.descripcion}
              </p>
            )}
          </div>

          {errores.ubicacion && (
            <p role="alert" className="rounded-boton border border-pico-rojo/30 bg-pico-rojo/5 px-3 py-2.5 text-sm text-pico-rojo motion-safe:animate-aparecer md:col-span-2">
              {errores.ubicacion}
            </p>
          )}
        </div>

        {/* Botones del mismo tamaño, cerrando la tarjeta (a lo ancho en el teléfono, a la derecha desde tableta). */}
        <div className="grid grid-cols-2 gap-3 border-t border-gris-borde bg-gris-fondo/40 px-5 py-4 motion-safe:animate-aparecer [animation-delay:360ms] md:flex md:justify-end md:px-7 md:[&>*]:w-52">
          <Boton href={salida} variante="secundario" className="h-12!">
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardada} className={`h-12! ${guardada ? "bg-pico-azul! opacity-100!" : ""}`}>
            {guardada ? (
              <span className="flex items-center gap-2 motion-safe:animate-latido">
                <Check className="size-5" strokeWidth={3} aria-hidden />
                ¡Guardada!
              </span>
            ) : (
              <>
                <Check className="size-5" strokeWidth={2.5} aria-hidden />
                Guardar
              </>
            )}
          </Boton>
        </div>
      </div>
    </form>
  );
}

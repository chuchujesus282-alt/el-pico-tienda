"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CircleCheck, LoaderCircle, User } from "lucide-react";
import { accionCrearCuenta } from "@/app/crear-cuenta/acciones";
import Boton from "@/components/ui/Boton";
import type { NuevaCuenta, PrefijoDocumento, TipoPersona } from "@/types/cuenta";
import BotonesSociales from "./BotonesSociales";
import { Aviso, Campo, CampoContrasena, Separador } from "./Campos";
import {
  LARGO_MINIMO_CONTRASENA,
  PREFIJOS,
  normalizarDocumento,
  normalizarTelefono,
  validarNuevaCuenta,
  type ErroresCuenta,
} from "./datosFiscales";

const TIPOS: { valor: TipoPersona; titulo: string; detalle: string; Icono: typeof User }[] = [
  { valor: "natural", titulo: "Persona", detalle: "La factura sale a tu nombre, con tu cédula o RIF.", Icono: User },
  { valor: "juridica", titulo: "Empresa", detalle: "La factura sale a nombre de la empresa, con su RIF.", Icono: Building2 },
];

/** Orden en que se revisan los campos: el primero con error recibe el foco. */
const ORDEN: (keyof ErroresCuenta)[] = ["nombre", "numeroDocumento", "telefono", "correo", "contrasena", "confirmacion", "aceptaPoliticas"];

function texto(datos: FormData, campo: string) {
  return String(datos.get(campo) ?? "").trim();
}

/** A dónde lleva el enlace del correo de confirmación (ya con la sesión abierta): a guardar sus direcciones, saludado por su nombre. */
function rutaBienvenida(nombre: string) {
  return `/mis-direcciones?bienvenida=${encodeURIComponent(nombre.trim().split(/\s+/)[0] ?? "")}`;
}

/**
 * Registro en una sola columna, como una conversación: primero quién eres, luego cómo entras.
 * Las direcciones de entrega no se piden aquí: al crear la cuenta se va a Mis direcciones a marcarlas en el mapa.
 */
export default function FormularioCrearCuenta() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoPersona>("natural");
  const [prefijo, setPrefijo] = useState<PrefijoDocumento>("V");
  const [errores, setErrores] = useState<ErroresCuenta>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  // Para avisar en vivo cuando las dos contraseñas ya coinciden.
  const [claves, setClaves] = useState({ contrasena: "", confirmacion: "" });
  const coinciden = claves.contrasena.length >= LARGO_MINIMO_CONTRASENA && claves.contrasena === claves.confirmacion;

  const empresa = tipo === "juridica";

  const cambiarTipo = (nuevo: TipoPersona) => {
    setTipo(nuevo);
    setPrefijo(PREFIJOS[nuevo][0].valor);
    setErrores((e) => ({ ...e, nombre: undefined, numeroDocumento: undefined }));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const cuenta: NuevaCuenta = {
      correo: texto(datos, "correo"),
      contrasena: String(datos.get("contrasena") ?? ""),
      aceptaPoliticas: datos.get("aceptaPoliticas") === "si",
      fiscales: {
        tipoPersona: tipo,
        nombre: texto(datos, "nombre"),
        documento: normalizarDocumento(prefijo, texto(datos, "numeroDocumento")) ?? "",
        telefono: normalizarTelefono(texto(datos, "telefono")) ?? "",
        contribuyenteEspecial: empresa && datos.get("contribuyenteEspecial") === "si",
      },
    };

    const nuevos = validarNuevaCuenta(cuenta, String(datos.get("confirmacion") ?? ""));
    setErrores(nuevos);
    setMensaje(null);

    const primero = ORDEN.find((campo) => nuevos[campo]);
    if (primero) {
      document.getElementById(primero)?.focus();
      return;
    }

    iniciar(async () => {
      const resultado = await accionCrearCuenta(cuenta, rutaBienvenida(cuenta.fiscales.nombre));
      if (!resultado.ok) return setMensaje(resultado.mensaje);
      // Hay que confirmar el correo antes de entrar: se avisa aquí y se limpia el formulario.
      if (resultado.aviso) {
        formulario.reset();
        setClaves({ contrasena: "", confirmacion: "" });
        return setMensaje(resultado.aviso);
      }
      router.push(rutaBienvenida(cuenta.fiscales.nombre));
    });
  };

  const actual = TIPOS.find((t) => t.valor === tipo)!;

  return (
    // Campos grandes, como en iniciar sesión (los de crear cuenta normal en otras pantallas no cambian).
    <div className="flex flex-col gap-7 [&_input:not([type=checkbox])]:h-14 [&_input:not([type=checkbox])]:pl-4 [&_input:not([type=checkbox])]:text-base [&_label]:text-[15px]">
      <BotonesSociales disabled={enviando} cascada={250} volverA="/mis-direcciones" />
      <div className="motion-safe:animate-aparecer [animation-delay:420ms]">
        <Separador texto="o con tu correo" />
      </div>

      <form
        onSubmit={enviar}
        onInput={(e) => {
          const campo = e.target as HTMLInputElement;
          if (campo.name === "contrasena" || campo.name === "confirmacion") setClaves((c) => ({ ...c, [campo.name]: campo.value }));
        }}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Persona o empresa: dos mitades de un mismo control, la elegida en blanco. */}
        <fieldset className="motion-safe:animate-aparecer [animation-delay:480ms]">
          <legend className="sr-only">¿Para quién es la cuenta?</legend>
          <div className="relative grid grid-cols-2 gap-1 rounded-tarjeta bg-gris-fondo p-1">
            {/* La píldora blanca se desliza hacia la opción elegida. */}
            <span
              className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-boton bg-pico-blanco shadow-tarjeta transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                empresa ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
              }`}
              aria-hidden
            />
            {TIPOS.map(({ valor, titulo, Icono }) => {
              const marcado = tipo === valor;
              return (
                <label
                  key={valor}
                  className={`relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded-boton text-[15px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul ${
                    marcado ? "text-pico-azul" : "text-gris-texto hover:text-pico-azul"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoPersona"
                    value={valor}
                    checked={marcado}
                    onChange={() => cambiarTipo(valor)}
                    className="sr-only"
                  />
                  <Icono
                    key={marcado ? "si" : "no"}
                    className={`size-5 ${marcado ? "motion-safe:animate-latido" : ""}`}
                    strokeWidth={marcado ? 2.25 : 1.75}
                    aria-hidden
                  />
                  {titulo}
                </label>
              );
            })}
          </div>
          <p key={tipo} className="mt-2 text-center text-[13px] text-gris-texto motion-safe:animate-aparecer">
            {actual.detalle}
          </p>
        </fieldset>

        <Campo
          id="nombre"
          etiqueta={empresa ? "Razón social" : "Nombre y apellido"}
          autoComplete={empresa ? "organization" : "name"}
          placeholder={empresa ? "Ej. Construcciones Ávila, C.A." : "Ej. María Pérez"}
          error={errores.nombre}
          className="motion-safe:animate-aparecer [animation-delay:540ms]"
        />

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4 motion-safe:animate-aparecer [animation-delay:600ms]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="numeroDocumento" className="text-sm font-semibold text-pico-azul">
              {empresa ? "RIF" : "Cédula o RIF"}
            </label>
            <div className="flex gap-2">
              <label htmlFor="prefijo" className="sr-only">
                Tipo de documento
              </label>
              <select
                id="prefijo"
                value={prefijo}
                onChange={(e) => setPrefijo(e.target.value as PrefijoDocumento)}
                className="h-14 w-16 shrink-0 cursor-pointer rounded-boton border border-gris-borde bg-pico-blanco px-2 text-base font-semibold text-pico-azul outline-none focus:border-pico-azul focus:ring-4 focus:ring-pico-azul-claro"
              >
                {PREFIJOS[tipo].map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
              <input
                id="numeroDocumento"
                name="numeroDocumento"
                inputMode={prefijo === "P" ? "text" : "numeric"}
                placeholder={empresa ? "12345678-9" : prefijo === "P" ? "Pasaporte" : "12345678"}
                aria-invalid={errores.numeroDocumento ? true : undefined}
                aria-describedby={errores.numeroDocumento ? "numeroDocumento-nota" : undefined}
                className={`w-full min-w-0 rounded-boton border bg-pico-blanco text-texto outline-none transition-shadow placeholder:text-gris-texto focus:ring-4 ${
                  errores.numeroDocumento
                    ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15"
                    : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro"
                }`}
              />
            </div>
            {errores.numeroDocumento && (
              <p id="numeroDocumento-nota" className="text-[13px] text-pico-rojo">
                {errores.numeroDocumento}
              </p>
            )}
          </div>

          <Campo
            id="telefono"
            etiqueta="Teléfono"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            placeholder="0412-1234567"
            error={errores.telefono}
          />
        </div>

        {empresa && (
          <label className="flex cursor-pointer items-start gap-3 rounded-tarjeta bg-gris-fondo px-4 py-3 motion-safe:animate-aparecer">
            <input type="checkbox" name="contribuyenteEspecial" value="si" className="mt-1 size-4 shrink-0 cursor-pointer accent-pico-azul" />
            <span>
              <span className="block font-semibold text-pico-azul">Somos contribuyente especial</span>
              <span className="block text-[13px] text-gris-texto">Si la empresa es agente de retención de IVA.</span>
            </span>
          </label>
        )}

        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@correo.com"
          error={errores.correo}
          className="motion-safe:animate-aparecer [animation-delay:660ms]"
        />

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4 motion-safe:animate-aparecer [animation-delay:720ms]">
          <CampoContrasena
            id="contrasena"
            etiqueta="Contraseña"
            autoComplete="new-password"
            placeholder={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres`}
            error={errores.contrasena}
          />
          <CampoContrasena
            id="confirmacion"
            etiqueta="Repítela"
            autoComplete="new-password"
            placeholder="La misma contraseña"
            error={errores.confirmacion}
          />
          {coinciden && !errores.confirmacion && (
            <p className="-mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-estado-abierto motion-safe:animate-aparecer sm:col-span-2" role="status">
              <CircleCheck className="size-4 motion-safe:animate-latido" aria-hidden />
              Las contraseñas coinciden
            </p>
          )}
        </div>

        <div className="motion-safe:animate-aparecer [animation-delay:780ms]">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              id="aceptaPoliticas"
              type="checkbox"
              name="aceptaPoliticas"
              value="si"
              aria-invalid={errores.aceptaPoliticas ? true : undefined}
              aria-describedby={errores.aceptaPoliticas ? "aceptaPoliticas-nota" : undefined}
              className="mt-1 size-4 shrink-0 cursor-pointer accent-pico-azul"
            />
            <span className="text-sm leading-relaxed text-gris-texto">
              Leí y acepto las{" "}
              <Link href="/politicas-de-privacidad" target="_blank" className="font-semibold text-pico-azul underline underline-offset-4 hover:text-pico-rojo">
                políticas de privacidad
              </Link>
              .
            </span>
          </label>
          {errores.aceptaPoliticas && (
            <p id="aceptaPoliticas-nota" className="mt-1.5 pl-7 text-[13px] text-pico-rojo">
              {errores.aceptaPoliticas}
            </p>
          )}
        </div>

        {mensaje && (
          <div className="motion-safe:animate-aparecer">
            <Aviso tipo="info">{mensaje}</Aviso>
          </div>
        )}

        <div className="mt-1 flex flex-col gap-3 motion-safe:animate-aparecer [animation-delay:840ms]">
          <Boton type="submit" anchoCompleto disabled={enviando} className="h-14! text-lg!">
            {enviando ? (
              <>
                <LoaderCircle className="size-5 animate-spin" aria-hidden />
                Creando tu cuenta…
              </>
            ) : (
              "Crear cuenta"
            )}
          </Boton>
          <p className="text-center text-[13px] text-gris-texto">Después marcas en el mapa dónde recibes tus pedidos.</p>
        </div>
      </form>
    </div>
  );
}

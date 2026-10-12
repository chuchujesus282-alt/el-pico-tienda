"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { accionCrearCuenta } from "@/app/crear-cuenta/acciones";
import Boton from "@/components/ui/Boton";
import type { NuevaCuenta, PrefijoDocumento, TipoPersona } from "@/types/cuenta";
import { Aviso, Campo, CampoContrasena, Selector } from "./Campos";
import {
  ESTADOS_VENEZUELA,
  LARGO_MINIMO_CONTRASENA,
  PREFIJOS,
  normalizarDocumento,
  normalizarTelefono,
  validarNuevaCuenta,
  type ErroresCuenta,
} from "./datosFiscales";

function Seccion({ numero, titulo, descripcion, children }: { numero: number; titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta md:p-6">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-sm font-bold text-pico-blanco"
          aria-hidden
        >
          {numero}
        </span>
        <div>
          <h2 className="text-lg font-bold text-pico-azul" aria-hidden>
            {titulo}
          </h2>
          {descripcion && <p className="text-[13px] text-gris-texto">{descripcion}</p>}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

const TIPOS: { valor: TipoPersona; titulo: string; detalle: string; icono: ReactNode }[] = [
  { valor: "natural", titulo: "Persona natural", detalle: "Factura a tu nombre, con cédula o RIF.", icono: <User className="size-5" aria-hidden /> },
  { valor: "juridica", titulo: "Empresa", detalle: "Factura a nombre de la empresa, con su RIF.", icono: <Building2 className="size-5" aria-hidden /> },
];

function texto(datos: FormData, campo: string) {
  return String(datos.get(campo) ?? "").trim();
}

export default function FormularioCrearCuenta() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoPersona>("natural");
  const [prefijo, setPrefijo] = useState<PrefijoDocumento>("V");
  const [errores, setErrores] = useState<ErroresCuenta>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const empresa = tipo === "juridica";

  const cambiarTipo = (nuevo: TipoPersona) => {
    setTipo(nuevo);
    setPrefijo(PREFIJOS[nuevo][0].valor);
    setErrores((e) => ({ ...e, nombre: undefined, numeroDocumento: undefined }));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);

    const cuenta: NuevaCuenta = {
      correo: texto(datos, "correo"),
      contrasena: String(datos.get("contrasena") ?? ""),
      fiscales: {
        tipoPersona: tipo,
        nombre: texto(datos, "nombre"),
        documento: normalizarDocumento(prefijo, texto(datos, "numeroDocumento")) ?? "",
        telefono: normalizarTelefono(texto(datos, "telefono")) ?? "",
        contribuyenteEspecial: empresa && datos.get("contribuyenteEspecial") === "si",
        direccion: texto(datos, "direccion"),
        zona: texto(datos, "zona"),
        ciudad: texto(datos, "ciudad"),
        estado: texto(datos, "estado"),
        codigoPostal: texto(datos, "codigoPostal") || null,
      },
    };

    const nuevos = validarNuevaCuenta(cuenta, String(datos.get("confirmacion") ?? ""));
    setErrores(nuevos);
    setMensaje(null);

    const primero = Object.keys(nuevos)[0];
    if (primero) {
      document.getElementById(primero)?.focus();
      return;
    }

    iniciar(async () => {
      const resultado = await accionCrearCuenta(cuenta);
      if (resultado.ok) router.push("/");
      else setMensaje(resultado.mensaje);
    });
  };

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Seccion numero={1} titulo="Datos de acceso" descripcion="Con ellos inicias sesión.">
        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@correo.com"
          error={errores.correo}
          className="md:col-span-2"
        />
        <CampoContrasena
          id="contrasena"
          etiqueta="Contraseña"
          autoComplete="new-password"
          ayuda={`Mínimo ${LARGO_MINIMO_CONTRASENA} caracteres.`}
          error={errores.contrasena}
        />
        <CampoContrasena id="confirmacion" etiqueta="Repite la contraseña" autoComplete="new-password" error={errores.confirmacion} />
      </Seccion>

      <Seccion numero={2} titulo="Datos de facturación" descripcion="Así saldrá tu factura. Revisa que coincidan con tu cédula o RIF.">
        <div className="grid gap-2 sm:grid-cols-2 md:col-span-2" role="radiogroup" aria-label="Tipo de cliente">
          {TIPOS.map((t) => (
            <label
              key={t.valor}
              className={`flex cursor-pointer items-start gap-3 rounded-tarjeta border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul ${
                tipo === t.valor ? "border-pico-azul bg-pico-azul-claro" : "border-gris-borde bg-pico-blanco hover:border-pico-azul/40"
              }`}
            >
              <input
                type="radio"
                name="tipoPersona"
                value={t.valor}
                checked={tipo === t.valor}
                onChange={() => cambiarTipo(t.valor)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pico-azul focus-visible:outline-none"
              />
              <span className="mt-px shrink-0 text-pico-azul">{t.icono}</span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-pico-azul">{t.titulo}</span>
                <span className="block text-[13px] leading-snug text-gris-texto">{t.detalle}</span>
              </span>
            </label>
          ))}
        </div>

        <Campo
          id="nombre"
          etiqueta={empresa ? "Razón social" : "Nombre y apellido"}
          autoComplete={empresa ? "organization" : "name"}
          placeholder={empresa ? "Ej. Construcciones Ávila, C.A." : "Ej. María Pérez"}
          error={errores.nombre}
          className="md:col-span-2"
        />

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
              className="h-11 w-16 shrink-0 rounded-boton border border-gris-borde bg-pico-blanco px-2 text-[15px] font-semibold text-pico-azul outline-none focus:border-pico-azul focus:ring-4 focus:ring-pico-azul-claro"
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
              placeholder={empresa ? "12345678-9" : prefijo === "P" ? "Número de pasaporte" : "12345678"}
              aria-invalid={errores.numeroDocumento ? true : undefined}
              aria-describedby="numeroDocumento-nota"
              className={`h-11 w-full min-w-0 rounded-boton border bg-pico-blanco px-3 text-[15px] text-texto outline-none transition-shadow placeholder:text-gris-texto/70 focus:ring-4 ${
                errores.numeroDocumento
                  ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15"
                  : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro"
              }`}
            />
          </div>
          <p id="numeroDocumento-nota" className={`text-[13px] ${errores.numeroDocumento ? "text-pico-rojo" : "text-gris-texto"}`}>
            {errores.numeroDocumento ?? (empresa ? "J: empresa privada · G: ente del Estado." : "V: venezolano · E: extranjero · P: pasaporte.")}
          </p>
        </div>

        <Campo
          id="telefono"
          etiqueta="Teléfono"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="0412-1234567"
          ayuda="Te escribimos por WhatsApp para coordinar tu pedido."
          error={errores.telefono}
        />

        {empresa && (
          <label className="flex cursor-pointer items-start gap-3 md:col-span-2">
            <input
              type="checkbox"
              name="contribuyenteEspecial"
              value="si"
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pico-azul"
            />
            <span className="text-sm">
              <span className="font-semibold text-pico-azul">Somos contribuyente especial</span>
              <span className="block text-[13px] text-gris-texto">Marca esta casilla si la empresa es agente de retención de IVA.</span>
            </span>
          </label>
        )}
      </Seccion>

      <Seccion numero={3} titulo="Dirección fiscal" descripcion="La que aparece en tu RIF. Sale impresa en la factura.">
        <Campo
          id="direccion"
          etiqueta="Dirección"
          autoComplete="address-line1"
          placeholder="Calle, edificio o casa, piso y número"
          error={errores.direccion}
          className="md:col-span-2"
        />
        <Campo id="zona" etiqueta="Urbanización o sector" autoComplete="address-line2" placeholder="Ej. Los Palos Grandes" error={errores.zona} />
        <Campo id="ciudad" etiqueta="Ciudad" autoComplete="address-level2" placeholder="Ej. Caracas" error={errores.ciudad} />
        <Selector
          id="estado"
          etiqueta="Estado"
          opciones={ESTADOS_VENEZUELA}
          textoVacio="Elige el estado"
          defaultValue=""
          autoComplete="address-level1"
          error={errores.estado}
        />
        <Campo
          id="codigoPostal"
          etiqueta="Código postal"
          opcional
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="Ej. 1060"
          maxLength={4}
          error={errores.codigoPostal}
        />
      </Seccion>

      {mensaje && <Aviso tipo="info">{mensaje}</Aviso>}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Boton href="/iniciar-sesion" variante="secundario" className="h-11">
          Ya tengo cuenta
        </Boton>
        <Boton type="submit" disabled={enviando} className="h-11 sm:min-w-48">
          {enviando ? "Creando tu cuenta…" : "Crear cuenta"}
        </Boton>
      </div>
    </form>
  );
}

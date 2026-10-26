import type { Metadata } from "next";
import FormularioPedirEnlace from "@/components/cuenta/FormularioPedirEnlace";
import PantallaCuenta from "@/components/cuenta/PantallaCuenta";
import { accionPedirCambioContrasena } from "./acciones";

// "¿Olvidaste tu contraseña?" — responsable: persona A. El enlace del correo lleva a /nueva-contrasena.

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function PaginaRecuperarContrasena() {
  return (
    <PantallaCuenta
      titulo="¿Olvidaste tu contraseña?"
      descripcion="Escribe el correo de tu cuenta y te enviamos un enlace para elegir una contraseña nueva."
    >
      <FormularioPedirEnlace accion={accionPedirCambioContrasena} />
    </PantallaCuenta>
  );
}

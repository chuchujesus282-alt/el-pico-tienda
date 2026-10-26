import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Boton from "@/components/ui/Boton";
import FormularioPedirEnlace from "@/components/cuenta/FormularioPedirEnlace";
import PantallaCuenta from "@/components/cuenta/PantallaCuenta";
import { haySesion, rutaSegura } from "@/lib/cuenta";
import { accionReenviarConfirmacion } from "./acciones";

// Confirmar el correo — responsable: persona A. El enlace del correo pasa por Better Auth (/api/auth/verify-email),
// que confirma el correo, abre la sesión y trae aquí; si el enlace venció o no sirve, llega con `?error=…`.
// - Con sesión: sigue directo a `volverA` (ej. /mis-direcciones con la bienvenida).
// - Sin sesión y sin error: el correo ya estaba confirmado (se abrió el enlace dos veces): a iniciar sesión.
// - Con error: explica qué pasó y deja pedir otro enlace.

export const metadata: Metadata = { title: "Confirmar correo", robots: { index: false } };

export default async function PaginaVerificarCorreo({ searchParams }: { searchParams: Promise<{ error?: string; volverA?: string }> }) {
  const { error, volverA } = await searchParams;

  if (!error) {
    if (await haySesion()) redirect(rutaSegura(volverA));
    return (
      <PantallaCuenta titulo="Tu correo ya está confirmado" descripcion="Inicia sesión con tu correo y tu contraseña para seguir.">
        <Boton href="/iniciar-sesion" anchoCompleto className="h-14! text-lg!">
          Iniciar sesión
        </Boton>
      </PantallaCuenta>
    );
  }

  const vencido = error === "TOKEN_EXPIRED";
  return (
    <PantallaCuenta
      titulo={vencido ? "Este enlace venció" : "Este enlace no sirve"}
      descripcion={
        vencido
          ? "Los enlaces para confirmar el correo duran 24 horas. Escribe tu correo y te enviamos otro."
          : "Puede que el enlace esté incompleto. Escribe tu correo y te enviamos otro."
      }
    >
      <FormularioPedirEnlace accion={accionReenviarConfirmacion.bind(null, volverA)} textoBoton="Enviarme otro enlace" />
    </PantallaCuenta>
  );
}

import type { Metadata } from "next";
import Boton from "@/components/ui/Boton";
import FormularioNuevaContrasena from "@/components/cuenta/FormularioNuevaContrasena";
import PantallaCuenta from "@/components/cuenta/PantallaCuenta";

// Elegir una contraseña nueva — responsable: persona A. Llega aquí desde el enlace del correo de /recuperar-contrasena:
// Better Auth revisa el enlace y manda `?token=…` si sirve o `?error=INVALID_TOKEN` si venció o ya se usó.

export const metadata: Metadata = {
  title: "Contraseña nueva",
  robots: { index: false },
  // El token va en la dirección: que no se lo pase a otros sitios si se toca un enlace.
  referrer: "no-referrer",
};

export default async function PaginaNuevaContrasena({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;

  if (error || !token) {
    return (
      <PantallaCuenta
        titulo="Este enlace ya no sirve"
        descripcion="Los enlaces para cambiar la contraseña duran 1 hora y se usan una sola vez. Pide uno nuevo."
      >
        <Boton href="/recuperar-contrasena" anchoCompleto className="h-14! text-lg!">
          Pedir otro enlace
        </Boton>
      </PantallaCuenta>
    );
  }

  return (
    <PantallaCuenta titulo="Elige tu contraseña nueva" descripcion="Al guardarla se cerrará tu sesión en los demás dispositivos.">
      <FormularioNuevaContrasena token={token} />
    </PantallaCuenta>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VistaMiCuenta from "@/components/cuenta/VistaMiCuenta";
import { leerPerfil } from "@/lib/cuenta";

// Mi cuenta — responsable: persona A. Solo con la sesión abierta (si no, a iniciar sesión).
// El diseño vive en components/cuenta/VistaMiCuenta.tsx: quién eres, atajos a lo tuyo y cerrar sesión; y los datos
// para la factura (quien entró con Google los llena aquí la primera vez).

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function PaginaMiCuenta() {
  const cuenta = await leerPerfil();
  if (!cuenta) redirect("/iniciar-sesion");
  return <VistaMiCuenta nombre={cuenta.nombre} correo={cuenta.correo} fiscales={cuenta.fiscales} />;
}

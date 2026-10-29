import type { Metadata } from "next";
import { redirect } from "next/navigation";
import VistaMiCuenta from "@/components/cuenta/VistaMiCuenta";
import { leerPerfil, misPedidos } from "@/lib/cuenta";

// Mi cuenta — responsable: persona A. Solo con la sesión abierta (si no, a iniciar sesión).
// El diseño vive en components/cuenta/VistaMiCuenta.tsx: quién eres, atajos a lo tuyo y cerrar sesión; y los datos
// para la factura (quien entró con Google los llena aquí la primera vez).

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function PaginaMiCuenta() {
  const [cuenta, pedidos] = await Promise.all([leerPerfil(), misPedidos(1, 5).catch(() => null)]);
  if (!cuenta) redirect("/iniciar-sesion");
  return (
    <VistaMiCuenta
      nombre={cuenta.nombre}
      correo={cuenta.correo}
      fiscales={cuenta.fiscales}
      pedidos={pedidos ? { recientes: pedidos.pedidos, total: pedidos.total } : undefined}
    />
  );
}

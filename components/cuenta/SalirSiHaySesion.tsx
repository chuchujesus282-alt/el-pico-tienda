"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authCliente } from "@/lib/authCliente";

/**
 * En /iniciar-sesion y /crear-cuenta: si se LLEGA con la sesión ya abierta, no tiene sentido mostrar el formulario y se
 * va a Mi cuenta (pedido de persona B). Se decide una sola vez, con la primera respuesta de la sesión: quien entra o se
 * registra AQUÍ sigue a su destino normal (inicio o la bienvenida), no a Mi cuenta. Va en el navegador y no en el
 * servidor para no competir con esa redirección después de entrar.
 */
export default function SalirSiHaySesion({ a = "/mi-cuenta" }: { a?: string }) {
  const { data: sesion, isPending } = authCliente.useSession();
  const router = useRouter();
  const decidido = useRef(false);

  useEffect(() => {
    if (isPending || decidido.current) return;
    decidido.current = true;
    if (sesion?.user) router.replace(a);
  }, [isPending, sesion, a, router]);

  return null;
}

import "server-only";

import type { Direccion } from "@/types/cliente";
import { direccionesMock } from "@/lib/mock/direcciones";

// ÚNICA puerta de entrada a los datos del cliente (perfil, direcciones).
// Aún no hay cuentas: devuelve direcciones de prueba. Cuando existan, aquí se leerán las del cliente
// con sesión iniciada y las pantallas no cambian.

export async function getDireccionesCliente(): Promise<Direccion[]> {
  return direccionesMock;
}

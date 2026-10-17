// Datos del cliente: ver docs/datos.md. Si cambia, avisa al compañero.

/** Punto marcado en el mapa (grados decimales). */
export type Ubicacion = { latitud: number; longitud: number };

/** Dirección de entrega guardada por el cliente. Puede tener varias y elegir una en cada pedido. */
export type Direccion = Ubicacion & {
  id: string;
  nombre: string; // ej. "Casa", "Obra La Trinidad"
  descripcion: string; // corta: edificio, piso, punto de referencia para el repartidor
};

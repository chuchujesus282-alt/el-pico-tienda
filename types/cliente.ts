// Datos del cliente: ver docs/datos.md. Si cambia, avisa al compañero.

export type Direccion = {
  id: string;
  alias: string; // ej. "Casa", "Obra Los Palos Grandes"
  direccion: string; // calle, edificio/casa, piso
  zona: string; // urbanización o sector, ciudad
  referencia: string | null; // punto de referencia para el repartidor
};

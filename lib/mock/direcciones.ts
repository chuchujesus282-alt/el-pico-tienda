import type { Direccion } from "@/types/cliente";

// Direcciones de prueba mientras no existan cuentas de cliente (ficticias).
export const direccionesMock: Direccion[] = [
  {
    id: "dir-1",
    alias: "Casa",
    direccion: "Av. Principal, Edif. Los Pinos, piso 4, apto 4-B",
    zona: "El Paraíso, Caracas",
    referencia: "Frente a la panadería",
  },
  {
    id: "dir-2",
    alias: "Obra",
    direccion: "Calle 3, casa 12, portón negro",
    zona: "La Trinidad, Caracas",
    referencia: null,
  },
  {
    id: "dir-3",
    alias: "Oficina",
    direccion: "Av. Francisco de Miranda, Centro Empresarial, piso 7",
    zona: "Chacao, Caracas",
    referencia: "Entrada por el estacionamiento",
  },
];

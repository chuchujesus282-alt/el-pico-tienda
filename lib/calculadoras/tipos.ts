import type { LucideIcon } from "lucide-react";
import type { IdMaterial } from "./materiales";

/** Medida que escribe el cliente (paso 1). */
export type Campo = {
  id: string;
  etiqueta: string;
  /** Unidad que se ve al lado del campo: "m", "m²", "cm"… */
  unidad: string;
  ayuda?: string;
  /** Valor inicial; null deja el campo vacío. */
  defecto: number | null;
  /** Opcional: vacío cuenta como 0 (ej. puertas y ventanas a descontar). */
  opcional?: boolean;
  maximo?: number;
  /** Solo números enteros (ej. cantidad de columnas). */
  entero?: boolean;
  /** Cambia la etiqueta según lo elegido en un grupo de opciones (ej. losa → "Largo", columna → "Altura"). */
  etiquetaSegun?: { grupo: string; etiquetas: Record<string, string> };
};

export type OpcionCalculadora = { valor: string; etiqueta: string; detalle?: string };

/** Grupo de opciones tipo tarjeta (paso 2). */
export type GrupoOpciones = {
  id: string;
  etiqueta: string;
  opciones: OpcionCalculadora[];
  defecto: string;
};

export type Entrada = {
  medidas: Record<string, number>;
  opciones: Record<string, string>;
};

/** Un material del resultado, ya redondeado hacia arriba a unidades de venta enteras. */
export type LineaMaterial = {
  material: IdMaterial;
  cantidad: number;
  /** De dónde sale la cantidad, en una línea (ej. "0,198 m³ de mezcla → 1,69 sacos"). */
  nota: string;
};

export type Dato = { etiqueta: string; valor: string };

export type Resultado = {
  materiales: LineaMaterial[];
  /** Cifras intermedias que se muestran al cliente (área, volumen, etc.). */
  datos: Dato[];
};

export type TipoDiagrama = "pared" | "superficie" | "volumen" | "techo" | "malla";

/**
 * Una calculadora completa. Para agregar otra: crea su archivo en lib/calculadoras/ con este objeto
 * y agrégala a la lista de registro.ts. Los componentes no se tocan.
 */
export type Calculadora = {
  slug: string;
  titulo: string;
  /** Una línea para la tarjeta del listado. */
  descripcion: string;
  icono: LucideIcon;
  diagrama: TipoDiagrama;
  /** Texto corto bajo el diagrama de "cómo medir". */
  comoMedir: string;
  campos: Campo[];
  grupos: GrupoOpciones[];
  /** Herramientas y extras recomendados (paso 3). */
  herramientas: IdMaterial[];
  /** Todos los materiales que puede devolver `calcular`, para pedir sus productos al catálogo. */
  materiales: IdMaterial[];
  /** Función pura: mismas medidas y opciones → mismo resultado. */
  calcular: (entrada: Entrada) => Resultado;
  /** "¿Cómo calculamos esto?", en lenguaje sencillo (un párrafo por elemento). */
  explicacion: string[];
};

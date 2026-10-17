import type { ComponentType } from "react";

/** Cualquier ícono que se pueda pasar como prop: los propios (components/icons/pico) y los de lucide. */
export type ComponenteIcono = ComponentType<{ className?: string }>;

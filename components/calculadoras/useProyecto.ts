"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useTasaBCV } from "@/components/layout/TasaBCV";
import type { IdMaterial } from "@/lib/calculadoras/materiales";
import { medidasCompletas, opcionesIniciales } from "@/lib/calculadoras/registro";
import type { Calculadora, Campo } from "@/lib/calculadoras/tipos";
import { numero } from "@/lib/calculadoras/util";
import type { DatosConfirmacion } from "./ConfirmacionCarrito";
import {
  armarLineas,
  CANTIDAD_MAXIMA,
  claveAjuste,
  leerNumero,
  textoParaCompartir,
  totales,
  type Ajustes,
  type LineaResumen,
  type ProductosPorCodigo,
} from "./proyecto";

/*
 * Estado y lógica de una calculadora, SIN diseño (lo usa CalculadoraProyecto). Separado para que el diseño de la
 * pantalla se pueda cambiar sin tocar el cálculo.
 */

const MS_AGREGADO = 2000;

/** Mensaje de error de una medida, o null si está bien (vacío no es error: solo falta). */
export function errorDeCampo(campo: Campo, texto: string): string | null {
  if (texto.trim() === "") return null;
  const n = leerNumero(texto);
  if (Number.isNaN(n)) return "Escribe solo números, por ejemplo 3,5.";
  if (n < 0 || (n === 0 && !campo.opcional)) return "Debe ser mayor que 0.";
  if (campo.entero && !Number.isInteger(n)) return "Debe ser un número entero.";
  if (campo.maximo && n > campo.maximo) return `El máximo es ${numero(campo.maximo)} ${campo.unidad}.`;
  return null;
}

/** Etiqueta del campo según la opción elegida (ej. "Largo del muro" o "Largo de la losa"). */
export function etiquetaDe(campo: Campo, opciones: Record<string, string>): string {
  return campo.etiquetaSegun?.etiquetas[opciones[campo.etiquetaSegun.grupo]] ?? campo.etiqueta;
}

/**
 * Todo lo que necesita una pantalla de calculadora: textos de las medidas, errores, opciones, extras, el resultado,
 * las líneas del resumen con sus totales y las acciones (agregar todo al carrito, compartir por WhatsApp).
 * `alAgregar` se llama después de "Agregar todo" (ej. para cerrar una hoja en móvil).
 */
export function useProyecto(calculadora: Calculadora, productos: ProductosPorCodigo, alAgregar?: () => void) {
  const { agregar, abrir } = useCarrito();
  const { tasa } = useTasaBCV();

  const [textos, setTextos] = useState<Record<string, string>>(() =>
    Object.fromEntries(calculadora.campos.map((c) => [c.id, c.defecto === null ? "" : numero(c.defecto)])),
  );
  const [opciones, setOpciones] = useState(() => opcionesIniciales(calculadora));
  const [extras, setExtras] = useState<IdMaterial[]>([]);
  const [ajustes, setAjustes] = useState<Ajustes>({});
  const [confirmacion, setConfirmacion] = useState<DatosConfirmacion | null>(null);
  const [recienAgregado, setRecienAgregado] = useState(false);

  // Medidas, errores y resultado: todo se recalcula con cada cambio.
  const { medidas, errores, resultado } = useMemo(() => {
    const errores: Record<string, string | null> = {};
    const medidas: Record<string, number> = {};
    for (const campo of calculadora.campos) {
      errores[campo.id] = errorDeCampo(campo, textos[campo.id] ?? "");
      const n = leerNumero(textos[campo.id] ?? "");
      if (!Number.isNaN(n)) medidas[campo.id] = n;
    }
    // En paredes: lo que se descuenta no puede ser toda la pared.
    if (!errores.vanos && medidas.vanos > 0 && medidas.largo > 0 && medidas.alto > 0 && medidas.vanos >= medidas.largo * medidas.alto) {
      errores.vanos = "No puede ser igual o mayor que el área de la pared.";
    }
    const valido = Object.values(errores).every((e) => !e) && medidasCompletas(calculadora, medidas);
    return { medidas, errores, resultado: valido ? calculadora.calcular({ medidas, opciones }) : null };
  }, [calculadora, textos, opciones]);

  const lineas = useMemo(() => {
    const conMateriales = resultado && { ...resultado, materiales: resultado.materiales.filter((m) => m.cantidad > 0) };
    return armarLineas(conMateriales, extras, ajustes, productos);
  }, [resultado, extras, ajustes, productos]);
  const { articulos, totalUsd, paraCarrito, porConsultar } = totales(lineas);

  const enlaceCompartir = resultado
    ? `https://wa.me/?text=${encodeURIComponent(textoParaCompartir(calculadora, { medidas, opciones }, resultado, lineas))}`
    : null;

  const cambiarTexto = (campoId: string, valor: string) => setTextos((t) => ({ ...t, [campoId]: valor }));
  const cambiarOpcion = (grupoId: string, valor: string) => setOpciones((o) => ({ ...o, [grupoId]: valor }));
  const cambiarCantidad = (linea: LineaResumen, cantidad: number) =>
    setAjustes((a) => ({ ...a, [claveAjuste(linea.material, linea.recomendada)]: Math.min(CANTIDAD_MAXIMA, Math.max(0, cantidad)) }));
  const alternarExtra = (id: IdMaterial) => setExtras((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  const agregarTodo = () => {
    if (paraCarrito.length === 0) return;
    // Mismo carrito de toda la tienda: una llamada a agregar() por producto.
    for (const linea of paraCarrito) agregar(linea.producto!, linea.cantidad);
    setConfirmacion({
      articulos: paraCarrito.reduce((suma, l) => suma + l.cantidad, 0),
      totalUsd,
      porConsultar: porConsultar.length,
    });
    setRecienAgregado(true);
    alAgregar?.();
  };

  useEffect(() => {
    if (!recienAgregado) return;
    const t = setTimeout(() => setRecienAgregado(false), MS_AGREGADO);
    return () => clearTimeout(t);
  }, [recienAgregado]);

  const cerrarConfirmacion = useCallback(() => setConfirmacion(null), []);
  const verCarrito = () => {
    setConfirmacion(null);
    abrir();
  };

  return {
    calculadora,
    tasa,
    textos,
    opciones,
    extras,
    medidas,
    errores,
    resultado,
    lineas,
    articulos,
    totalUsd,
    paraCarrito,
    porConsultar,
    enlaceCompartir,
    confirmacion,
    recienAgregado,
    cambiarTexto,
    cambiarOpcion,
    cambiarCantidad,
    alternarExtra,
    agregarTodo,
    cerrarConfirmacion,
    verCarrito,
  };
}

export type EstadoProyecto = ReturnType<typeof useProyecto>;

"use client";

import { useEffect, useRef } from "react";

/**
 * Al cambiar lo que muestra la lista (subcategoría, orden, filtro…), lleva al comienzo del listado (#listado, en
 * app/categoria/[slug]/page.tsx): ahí está "Mostrando N de M" y el primer producto.
 *
 * Los enlaces de los filtros usan `scroll={false}` para no saltar hasta el banner en cada toque, pero eso dejaba la
 * página donde estaba: si estabas abajo en una subcategoría larga y elegías una corta, caías en el pie de página
 * (pedido de persona A). Solo se mueve si ya habías bajado más allá del listado; si estás arriba, no salta. No dibuja
 * nada.
 */
export default function IrAlListado({ clave }: { clave: string }) {
  const anterior = useRef(clave);

  useEffect(() => {
    if (anterior.current === clave) return; // primera carga de la página: no se toca
    anterior.current = clave;
    const listado = document.getElementById("listado");
    if (!listado) return;
    // scroll-margin-top de #listado deja el comienzo debajo del header fijo.
    const margen = parseFloat(getComputedStyle(listado).scrollMarginTop) || 0;
    if (listado.getBoundingClientRect().top < margen) {
      listado.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [clave]);

  return null;
}

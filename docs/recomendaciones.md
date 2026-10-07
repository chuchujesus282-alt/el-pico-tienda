# Búsqueda y recomendaciones

Tres funciones con piezas compartidas, todas en `lib/recomendaciones/` (lógica pura, sin React):

1. **Búsqueda inteligente**: buscador del header con sugerencias en vivo + página `/buscar?q=…`.
2. **Productos relacionados** ("También te puede servir"): para la página de producto.
3. **"Te puede interesar" personalizado**: carrusel del inicio.

Pruebas: `npm test` (Vitest). Cubren los ejemplos de abajo y miden la velocidad con 2000 productos.

## Archivos

| Archivo | Qué hace |
|---|---|
| `datos/sinonimos.json` | Sinónimos de ferretería (editable sin programar) |
| `datos/complementarios.json` | Qué se usa junto con qué (editable) |
| `datos/consumibles.json` | Lo que se gasta y se puede volver a sugerir (editable) |
| `lib/recomendaciones/medidas.ts` | Unifica medidas: `1/4`, `1/4"`, `¼`, "un cuarto", `1/4 pulg`, `2/8` → `1/4` |
| `lib/recomendaciones/normalizar.ts` | `palabrasClave(texto)`: minúsculas, sin acentos, medidas, singular, sinónimos |
| `lib/recomendaciones/diccionarios.ts` | Lee los JSON de `datos/`; `complementosDe()`, `esConsumible()` |
| `lib/recomendaciones/productos.ts` | Prepara el catálogo una vez; `masVendidos()` |
| `lib/recomendaciones/busqueda.ts` | `crearIndice()`, `sugerir()`, `buscar()`, `quisoDecir()` (MiniSearch) |
| `lib/recomendaciones/relacionados.ts` | `relacionados()`, `complementariosDe()`, `similaresDe()`, `compradosJuntos()` |
| `lib/recomendaciones/perfil.ts` | Pesos de las señales, olvido con el tiempo, `senalesDesdeCompras()` |
| `lib/recomendaciones/almacenPerfil.ts` | Guarda el perfil en `localStorage` (`el-pico:perfil`), siempre con try/catch |
| `lib/recomendaciones/interesar.ts` | `tePuedeInteresar()` |
| `lib/recomendaciones/__tests__/` | Pruebas |
| `app/api/indice-busqueda/route.ts` | Entrega el catálogo al navegador (caché de 5 min) |
| `app/buscar/page.tsx` | Página de resultados |
| `components/busqueda/` | `BuscadorConSugerencias` (header), `SinResultados`, `indiceCliente` |
| `components/recomendaciones/` | `ProductosRelacionados`, `TePuedeInteresar`, `RegistrarSenal` |

Los algoritmos **reciben** la lista de productos; nunca la buscan. Los datos llegan por `lib/catalogo.ts`
(`getIndiceProductos`, `getMasVendidos`, `getCompradosJuntos`), así que al conectar el SQL no se tocan los algoritmos.

## Cómo usar los componentes

```tsx
// Página de producto (Server Component), abajo de todo:
import ProductosRelacionados from "@/components/recomendaciones/ProductosRelacionados";
import RegistrarSenal from "@/components/recomendaciones/RegistrarSenal";

<RegistrarSenal senales={[{ tipo: "visto", id: producto.id }]} />   {/* anota "producto visto" */}
<ProductosRelacionados producto={producto} className="mt-10" />     {/* "También te puede servir" */}

// Inicio: los más vendidos llegan del servidor y en el navegador se personaliza.
<TePuedeInteresar inicial={await getMasVendidos(10)} />

// Header: <BuscadorConSugerencias /> ya está puesto.
```

Señales que ya se anotan solas: **carrito** (en `agregar()` de `ProveedorCarrito`), **whatsapp** (botón "Enviar pedido por WhatsApp"
de `PanelCarrito`) y **búsqueda** (página `/buscar`). Si el pedido sale a WhatsApp desde otro lugar (por ejemplo
`/finalizar-pedido`), agrega ahí: `registrarSenales(items.map((i) => ({ tipo: "whatsapp", id: i.producto.id })))`.

## Cómo funciona

**Normalización** (igual para productos y búsquedas): minúsculas → sin acentos → medidas unificadas → palabras →
raíz singular ("tornillos" = "tornillo", "cables" = "cable") → sin palabras vacías ("de", "para"…) → sinónimos
(cada variante se cambia por la palabra principal del grupo). El **tipo** de un producto es su primera palabra clave.

**Búsqueda**: MiniSearch (≈7 KB) en vez de Fuse.js porque busca por palabras (el orden no importa), usa un índice
(≈1 ms por búsqueda con 2000 productos; Fuse revisa todo el catálogo en cada tecla) y acepta nuestra normalización.
Tolera 1 error de tipeo cada 5 letras; las medidas nunca se "corrigen" (1/4 no es 1/2). Orden: coincidencia exacta →
tipo y medida → completa con errores → parcial; a igualdad, el más vendido. Sin resultados: "¿Quisiste decir…?" +
lo más vendido de la categoría más parecida (o de la tienda).

**Relacionados**: hasta 2 "comprados juntos" (cuando haya facturas) + complementarios (el mejor de cada tipo del mapa,
prefiriendo la misma medida: tornillo 1/4 → broca 1/4) intercalados con similares (mismo tipo/subcategoría, medida,
marca, precio cercano). Siempre entre 4 y 8; si faltan, los más vendidos de la categoría.

**Te puede interesar**: pesos WhatsApp/compra 8, carrito 4, visto 2, búsqueda 1; cada señal vale la mitad cada 30 días.
De lo pedido y lo del carrito salen sus complementarios; de lo visto, sus similares; de las búsquedas, sus resultados.
No se sugiere lo que está en el carrito ni lo ya pedido, salvo los consumibles. Cliente nuevo: los más vendidos.
Para usar el historial del SQL: `senalesDesdeCompras(compras)` y sumar esas señales a las del navegador.

## Cómo ampliar los diccionarios (sin programar)

Los tres archivos están en `datos/`. Da igual mayúsculas, acentos o plural. Después de editar, corre `npm test`:
si el JSON quedó mal escrito (falta una coma o unas comillas), la prueba lo avisa.

**Sinónimos** (`datos/sinonimos.json`): cada línea es un grupo; la primera palabra es la principal.
```json
["broca", "mecha"],
["manguera", "goma"]          ← línea nueva: "goma" encuentra mangueras
```

**Complementarios** (`datos/complementarios.json`): tipo de producto → lo que se usa con él, en orden de importancia.
El tipo es como empieza el nombre del producto en el sistema.
```json
"cemento": ["llana", "pala", "cuchara de albanil", "balde"],
"lija": ["pintura", "mascarilla"]          ← línea nueva
```

**Consumibles** (`datos/consumibles.json`): agrega cómo empieza el nombre: `"lija"`, `"disco"`…

Recuerda la coma al final de cada línea menos la última de la lista.

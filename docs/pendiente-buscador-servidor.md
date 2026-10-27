# Pendiente: buscador y sugerencias desde el servidor

Escrito el 2026-10-26 por persona A (con Claude Code) para continuar en otra computadora y otra sesión.
**Estado: plan APROBADO por el dueño, sin empezar.** No hay código de esto en `main` todavía.
Bórralo (y su línea en `CLAUDE.md`) cuando todo esté hecho.

## Por qué

Hoy el buscador del header, "Te puede interesar" y la página de Favoritos **descargan el catálogo completo al
navegador** (`GET /api/indice-busqueda`). Con Herramientas ya son ~3.200 productos (730 KB, 104 KB comprimido). El
dueño tiene **cerca de 30.000 productos** y quiere conectar las demás categorías de Saint; **antes de conectar otra
categoría, esto tiene que estar hecho.**

Medido con 30.000 productos (prueba local con nombres reales de Saint repetidos):

| | En el navegador (hoy) | En el servidor (plan) |
|---|---|---|
| Descarga | 6,6 MB (≈0,9 MB gzip) | ~2 KB por consulta |
| Memoria | ~76 MB en el teléfono | ~76 MB en el servidor, una vez |
| Armar el índice (`crearIndice`) | en cada teléfono | 0,43 s, una vez |
| Búsqueda / sugerencia | — | ~3 ms / ~1,4 ms |
| `relacionados()` / `tePuedeInteresar()` | — | ~8 ms / ~2 ms |

El motor (`lib/recomendaciones/`: corrección de errores tipo "martiyo", sinónimos de `datos/*.json`, medidas) **no
cambia**: solo cambia dónde corre.

## Decisiones del dueño (no volver a preguntar)

1. **Él mantiene la API de Saint** y la va a actualizar para que:
   - acepte **varias categorías en un solo pedido**, separadas por coma: `&categoria=1171,1200`;
   - traiga **`codCategoria` en cada producto y en cada subcategoría**;
   - responda **comprimido con gzip**.
   Hasta que esté, la API exige una categoría (sin `categoria` responde `400 {"error":"Falta la categoria"}`).
   **Antes de tocar el código, prueba la API nueva con curl** y confirma la forma real de la respuesta (no asumas).
2. **Nada de cron jobs** (en el plan Hobby de Vercel solo corren una vez al día). Si el índice no está listo, las
   sugerencias responden **vacías y rápido**, y el índice se arma **en segundo plano**.

## Plan (pasos)

1. **Saint en un solo pedido** (`lib/saint.ts`), cuando la API nueva esté publicada:
   - `getTodosSaint()` pide todas las categorías de `CATEGORIAS_SAINT` juntas (`&categoria=1171,1200,...`) y reparte
     por `codCategoria` → slug. Conservar la estructura por categoría (`CategoriaSaint`: `productos`, `claves`,
     `subcategorias`, `tasa`) para que `getCategoriaSaint(slug)` y la página de categoría no cambien.
   - Ojo: **la caché de datos de Next no guarda respuestas de más de 2 MB** (30.000 productos ≈ 5–6 MB sin comprimir;
     gzip no cuenta, Next guarda el cuerpo ya descomprimido). Para el pedido grande, la caché real es la memoria del
     servidor (`guardadas` en `lib/saint.ts`, que ya guarda la última lista buena). El `fetch` de Node pide y
     descomprime gzip solo.
   - Mantener: nunca copiar existencias; si Saint falla, usar la última lista buena; mensajes de error SIN la URL
     (lleva la clave).
   - Si una categoría grande sigue yendo sola, también sirve: el plan no depende de esto.
2. **Índice único en el servidor.** Un módulo nuevo solo de servidor (p. ej. `lib/indiceServidor.ts`) que arma
   `crearIndice(productos)` con `getIndiceConEstado()` de `lib/catalogo.ts` (ya devuelve la MISMA lista mientras
   nada cambie: base de ejemplo + Saint) y lo reutiliza mientras la lista sea la misma. Un solo armado a la vez
   (promesa compartida).
   - `indiceSiEstaListo()`: devuelve el índice o `null` sin esperar, y si no está, **dispara el armado en segundo
     plano**. En Vercel, el trabajo que sigue después de responder se congela: usar **`after()` de `next/server`**
     para que el armado continúe (revisa la doc en `node_modules/next/dist/docs/`).
   - `indice()`: espera el armado (para `/buscar`).
3. **Sugerencias del header: `GET /api/sugerencias?q=...`.**
   - Usa `sugerirCorrigiendo(indice, q, 6)`; responde `{ productos, correccion, listo }` con los campos mínimos para la
     fila de sugerencia (`id, titulo, nombre, marca, precio, imagen, categoriaSlug, subcategoria`).
   - Índice no listo → `{ productos: [], correccion: null, listo: false }` en < 1 s (sin esperar), y el armado sigue
     en segundo plano.
   - Validar `q` (recortar, máx. ~80 caracteres; < 2 letras → vacío).
   - Cabecera `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` (consultas repetidas no llegan al
     servidor). No cachear respuestas con `listo: false`.
4. **`components/busqueda/BuscadorConSugerencias.tsx`**: en vez de `cargarIndice()` + `sugerirCorrigiendo` local, hace
   `fetch("/api/sugerencias?q=")` desde 2 letras, con ~150 ms de espera tras la última tecla y `AbortController` para
   cancelar la consulta anterior. Si llega `listo: false`, puede reintentar una vez a ~1,5 s. **Mismo diseño y mismo
   comportamiento de teclado/accesibilidad**; solo cambia de dónde salen los datos.
5. **`/buscar`** (`app/buscar/page.tsx`) ya corre en el servidor con `getIndiceProductos()`: que use el índice
   compartido del paso 2 (esperándolo) en vez de armar el suyo.
6. **"Te puede interesar"** (`components/recomendaciones/TePuedeInteresar.tsx`): el navegador manda lo que el cliente
   miró (`leerSenales()` de `lib/recomendaciones/almacenPerfil.ts`, últimas ~50) y los códigos de su carrito a un
   endpoint o acción de servidor (p. ej. `POST /api/te-puede-interesar`), que corre
   `tePuedeInteresar({ productos, senales, enCarrito, indice, limite: 10 })` y devuelve los 10 productos. Validar y
   limitar lo que llega. Mientras responde, los esqueletos de siempre. Sin índice listo: los más vendidos.
7. **Favoritos** (`components/favoritos/ListaFavoritos.tsx`): manda los códigos guardados (máx. 200) y el servidor
   devuelve solo esos productos (con un `Map` por id del índice). Conservar lo que hace hoy con códigos que ya no
   existen. Si el catálogo está incompleto (`completo: false`), no tratar como "ya no existe" lo que falte.
8. **Limpieza:** borrar `app/api/indice-busqueda/route.ts` y `components/busqueda/indiceCliente.ts`;
   `grep -rn "indice-busqueda\|indiceCliente\|cargarIndice\|cargarProductos"` debe quedar vacío.
   `crearIndicePorPartes` queda sin uso en el navegador: se puede dejar (tiene pruebas) o borrar.
9. **Docs:** actualizar `docs/recomendaciones.md`, `docs/datos.md` (respuesta nueva de Saint) y en `CLAUDE.md` la
   línea de Arquitectura que dice "Para buscar en el navegador usa `cargarIndice()`…". Entrada en el Registro de
   cambios (compartido: el buscador del header es de todos).
10. **Pruebas:**
    - Vitest: el endpoint (q vacío/corto/largo, índice no listo, corrección), favoritos por ids, te-puede-interesar
      con señales inventadas. Rendimiento con 30.000 productos sintéticos (ver
      `lib/recomendaciones/__tests__/rendimiento.test.ts`, hoy con 2.000).
    - Chrome headless: escribir en el buscador ("martiyo", "llave combinada 11"), ver sugerencias y corrección;
      "Te puede interesar" en el inicio; Favoritos; y comprobar en la pestaña de red que **nada** descarga el catálogo.
    - Medir tiempos (PC y teléfono simulado) y reportarlos al dueño **antes de subir a `main`**.

## Eventos para análisis: no romperlos (agregado el 2026-10-27)

Desde la fase 4 de cuentas hay eventos para análisis (`lib/eventos/`, `docs/eventos.md`). Es una pieza aparte: el
buscador solo la "llama". Al mover el buscador al servidor:
- El evento de búsqueda vive en **`app/buscar/page.tsx`**: `<RegistrarEvento evento={{ tipo: "busqueda", termino:
  consulta, resultados: cantidad }} />`. Si esa página cambia, **conserva esa línea** (con la cantidad real de
  resultados que muestra).
- **`/api/sugerencias` NO debe registrar eventos**: cada letra que se escribe no es una búsqueda. Si algún día se
  quiere medir qué sugerencia se tocó, se agrega un tipo nuevo con `registrarEvento()` (ver "Agregar un evento nuevo"
  en `docs/eventos.md`), sin tocar `/api/eventos`.
- "Te puede interesar" y Favoritos no registran eventos; `ProveedorCarrito.agregar` y `useFavoritos().alternar` sí:
  no los quites si tocas esos archivos.

## Estado actual (2026-10-26)

**En `main`:**
- `1ef4063` — Herramientas con los productos REALES de Saint (detalle en el Registro de cambios de `CLAUDE.md`):
  - mapa `lib/categoriasSaint.ts` (`herramientas: 1171`; las demás siguen con `lib/mock/`);
  - `lib/saint.ts` (un pedido por categoría, `revalidate: 600`, lista en memoria, última lista buena, `ErrorSaint`);
  - `lib/nombresSaint.ts` (`nombreLegible`, se guarda en `Producto.titulo`);
  - `lib/catalogo.ts`: `getProductosPorCategoria` filtra/busca (`q`)/ordena/pagina en el servidor (24 por página);
    `getIndiceConEstado()` (base + Saint, misma lista mientras nada cambie, `completo`);
  - página de categoría: subcategorías con cantidad, sin filtro de marca en Saint, `BuscarEnCategoria`, `SinCatalogo`;
  - producto: $ + Bs con la tasa de Saint; imagen genérica por subcategoría (`iconoDeProducto`);
  - `lib/tasa.ts`: `TASA_API_URL` y respaldo con la tasa de Saint;
  - `lib/cuenta.ts`: el carrito/favoritos de la cuenta no pierden productos si Saint está caído.
- `de90870` — Cuentas fase 3 (Mi cuenta, carrito y favoritos en la cuenta) y correos con logo nítido.

**Falta:** todo este plan. Además, cuando la red esté normal, medir la velocidad de Herramientas en producción
(`https://el-pico-tienda.vercel.app/categoria/herramientas`); en la computadora dio 1,0–2,6 s la primera vez (casi
todo es esperar a Saint) y ~0,02 s las siguientes.

## Calculadoras: códigos propuestos (PENDIENTE de revisar con persona B)

Cinco materiales de `lib/calculadoras/materiales.ts` apuntaban a herramientas de ejemplo que ya no existen; hoy salen
como "Consultar disponibilidad". **No cambiar nada hasta que el dueño diga qué códigos usar.**

| Material (clave) | Hoy | Propuesta | Precio | Alternativas |
|---|---|---|---|---|
| `nivel` | 00302338 | `NIKAT087` Nikato nivel de aluminio 24" | $12,89 | `GN16193` Hoteche magnético 24" ($13,23), `GN60724` Da Hai 60 cm 24" ($18,50) |
| `cinta-metrica` | 00302177 | `BRUF0525` Brufer cinta métrica 5 m × 19 mm | $3,93 | `TRUP0772` Truper 5 m ($5,57) |
| `segueta` | 00302314 | `STLY1092` Stanley arco de segueta 12" fijo | $12,16 | `SUPER003` Superior tubular ($6,63), `NIKAT032` Nikato 12" ($17,15) |
| `espatula` | 00302354 | `LBS0108` Lobster espátula 4" mango de madera | $3,33 | `BRUF0208` Brufer 4" ($2,49) |
| `taladro` | 00302011 | `NIKAT081` Nikato taladro percutor 1/2" 600 W | $67,77 | `CAT0042` Wesco 550 W ($50,95), `BSC0165` Bosch 1/2" ($140,36) |

(Precios de Saint del 2026-10-25.) Al cambiarlos: la prueba "todo material y herramienta apunta a un producto que
existe en el catálogo de prueba" (`lib/calculadoras/__tests__/calculadoras.test.ts`) usa `lib/mock/catalogoPruebas.ts`;
habrá que ajustarla (los códigos reales no están en los datos de prueba). Después se pueden borrar las fotos de ejemplo
`public/productos/00302*.webp` y sus líneas en `public/productos/CREDITOS.md` (solo las usaba el mock).

## Detalles para continuar sin este chat

- **Repo:** `kit-el-pico/kit-el-pico` (carpeta en OneDrive). El dueño es persona A y sube directo a `main` cuando dice
  "súbelo"; antes: `npm run lint`, `npx vitest run`, `npm run build`, pruebas en Chrome headless, `git pull --rebase`
  y nota en el Registro de cambios de `CLAUDE.md`. No subir sin que el dueño revise los números de rendimiento.
- **Variables** (solo en `.env.local` y en Vercel; **nunca** en el repo ni en mensajes de commit):
  `PRODUCTOS_API_URL` (`https://api.centroferreteroelpico.com/productos?clave=...`, la clave la tiene el dueño; se le
  suma `&categoria=CODIGO`) y `TASA_API_URL` (`.../tasa-bcv?clave=...`, responde `{ "tasa": 887.3 }`).
  En la otra computadora hay que copiarlas a su `.env.local` (pídeselas al dueño).
- **Respuesta actual de Saint** (una categoría):
  `{ tasa, categoria, total, subcategorias: [{ codigo, nombre, cantidad }], productos: [{ codigo, nombre, marca,
  codSubcategoria, subcategoria, precioBs, precioUsd }] }`. `precioBs` trae IVA; `precioUsd = precioBs / tasa`.
  Marca "S/M" = sin marca. Herramientas (1171): 3.177 productos, ~590 KB, 1–4 s.
- **Probar en Windows/OneDrive:** `next dev` puede fallar porque OneDrive bloquea `.next`; lo seguro es
  `npm run build` + `npx next start -p 3100`. Para medir "la primera vez", borrar `.next/cache/fetch-cache` antes de
  arrancar. Al terminar, cerrar el proceso de Node del puerto (detener la consola que lo lanzó no siempre lo cierra).
  Chrome headless se maneja por CDP (`chrome --headless=new --remote-debugging-port=...`); los scripts de prueba
  de esta sesión no están en el repo.
- **Archivos con saltos de línea de Windows (CRLF):** al editar con scripts, normaliza a `\n` y vuelve a CRLF, o usa
  la herramienta de edición.
- **Hallazgo para persona B (ya anotado en el Registro):** si `app/categoria/[slug]/page.tsx` lanza un error mientras
  carga (dentro de `loading.tsx`), `error.tsx` no se mostraba y quedaba el esqueleto. Por eso el error de Saint se
  atrapa en la página (`SinCatalogo`). Tenerlo en cuenta si las sugerencias o Favoritos usan límites de error.
- **Reglas que siguen valiendo:** nunca mostrar existencias ni cantidades de inventario; si Saint no responde, nunca
  mostrar productos de ejemplo en su lugar; la clave nunca llega al navegador; el diseño del buscador es compartido
  con persona B (no cambiarlo, solo la fuente de datos).
- **Otros pendientes del proyecto (no son de este plan):** cuentas fase 4 (eventos con la cookie anónima
  `el-pico-visitante`), fase 5 (pedidos con la tasa BCV del momento y direcciones en la cuenta; toca piezas de
  persona B, avisar en `CLAUDE.md`) y fase 6 (`/privacidad` reemplaza a `/politicas-de-privacidad` con redirección);
  `CONTACTO` en `lib/tienda.ts`; logo de USDT.

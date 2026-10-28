# Pendiente: buscador y sugerencias desde el servidor

Escrito el 2026-10-26 por persona A (con Claude Code) para continuar en otra computadora y otra sesión.
**Estado (2026-10-28): el plan del buscador está HECHO** (ver el Registro de cambios de `CLAUDE.md`). Este archivo
queda solo por la sección "Calculadoras: códigos propuestos" (pendiente con persona B); bórralo (y su línea en
`CLAUDE.md`) cuando eso también esté hecho. Lo de abajo sobre el buscador queda como historial.

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

Desde el 2026-10-28 TODOS los materiales de `lib/calculadoras/materiales.ts` tienen `productoId: null` (salen como
"Consultar disponibilidad"): apuntaban a productos de ejemplo, que se borraron. Propuesta de códigos REALES de Saint
(precios del 2026-10-28). **No cambiar nada hasta que el dueño y persona B lo revisen.** "⚠" = la presentación no
coincide con la que supone la calculadora (`PRESENTACION` en `lib/calculadoras/constantes.ts`): hay que ajustar la
constante o elegir otro producto.

| Material (clave) | Propuesta | Precio | Nota / alternativas |
|---|---|---|---|
| `cemento` | `CONST0082` Mortero saco cemento gris 42,5 kg | $13,77 | `GN00799` cemento gris por kilo ($0,83) |
| `arena` | `CONST0010` Metro de arena lavada | $55,68 | `CONST0095` saco de arena lavada ($3,65) |
| `piedra` | `CONST0018` Metro de piedra | $61,87 | No dice "picada 3/4" |
| `bloque-arcilla-10` | `CONST0001` Bloque de arcilla 10×20×30 | $0,82 | |
| `bloque-arcilla-15` | `CONST0005` Bloque de arcilla 15×20×30 | $0,87 | `CONST0003` 12×20×30 ($0,84) |
| `bloque-arcilla-20` | — | | No hay bloque de arcilla de 20 en Saint |
| `bloque-concreto-10` | `CONST0121` Bloque Aliven 10 | $1,24 | ⚠ Aliven (liviano), no hay bloque de concreto común |
| `bloque-concreto-15` | `CONST0123` Bloque Aliven 15 | $1,42 | ⚠ ídem; `CONST0141` bloque "U" 15×20×40 ($1,99) |
| `bloque-concreto-20` | `CONST0124` Bloque Aliven 20 | $1,91 | ⚠ ídem |
| `cabilla-3/8` | `CONST0424` Cabilla estriada 3/8 × 12 m | $15,18 | ⚠ barra de 12 m (la calculadora supone 6 m) |
| `cabilla-1/2` | `CONST0429` Cabilla estriada 1/2" × 12 m | $20,63 | ⚠ 12 m; `CONST0425` alambrón estriado 12 mm × 6 m ($10,32) |
| `cabilla-5/8` | `CONST0423` Cabilla estriada 5/8 (16 mm) × 6 m | $21,13 | |
| `alambre` | `GN12855` Alambre galvanizado rollo pequeño | $2,65 | ⚠ no hay "alambre dulce 1 kg"; `GN12332` galvanizado grueso ($7,95) |
| `pintura-cunete` | `MANP0103` Manpica Titán caucho tipo "C" tobo | $44,21 | `MNT1013` ABC caucho blanco tobo 4 gal ($63,25) |
| `pintura-galon` | `MANP0102` Manpica Titán caucho tipo "C" galón | $12,76 | `MNT1010` ABC caucho blanco galón ($16,65) |
| `sellador` | `GN60039` PC3 sellador de usos múltiples galón | $21,75 | `ADESI006` Adesi-Top sellador blanco galón ($68,87); confirmar que sirve como antialcalino |
| `manto` | `IPA0030` Cindu rollo manto asfáltico 3,15 mm | $59,50 | `IPA0084` 2,7 mm ($55,07) |
| `primer-asfaltico` | `IPA0055` Primer galón | $25,18 | `IPA0034` primer cuñete ($88,84) |
| `impermeabilizante-acrilico` | `GN00880` PC3 impermeabilizante con fibra galón | $42,05 | `ADESI007` Adesi-Top #205 galón ($29,39) |
| `ceramica` | `CERAM002` Cerámica 8701 plana blanca 30×30 | $27,38 | ⚠ 30×30 (la calculadora supone 45×45, caja de 2,03 m²) |
| `porcelanato` | `CERAM045` Ceramicol porcelanato Urban Grey 60×60 | $56,66 | ⚠ confirmar m² por caja |
| `pego` | `CONST0133` Gold pego gris Ceramipeg | $6,22 | ⚠ confirmar kilos; `CONST0021` Keraflex saco 25 kg ($62,69) |
| `carato` | — | | No hay carato en Saint |
| `lamina-zinc` | `GN11420` Lámina zinc normal 3,60 m | $8,85 | |
| `lamina-acerolit` | `CONST0168` Lámina Acerotec/Superlit 3,00 m | $55,27 | ⚠ 3,00 m (la calculadora supone 3,66); `GN14950` tipo acerolit transparente 3,5 m ($111,03) |
| `tornillo-techo` | `TOR1146` Tornillo autotaladrante hex 14×1" | $0,21 | ⚠ se vende por unidad (la calculadora pide bolsas de 100) |
| `lamina-drywall` | `CONST0032` Lámina drywall 1/2" 1,22×2,44 m | $20,85 | |
| `paral` | `GN09936` Perfil paral 1-5/8" 3,05 m cal. 26 | $4,67 | ⚠ 1-5/8" (la calculadora dice 2-1/2") |
| `riel` | `GN09860` Perfil riel 1-5/8" 3,05 m cal. 26 | $4,36 | ⚠ ídem |
| `tornillo-drywall` | `TOR1220` Tornillo drywall rosca gruesa 6-9×1" | $0,08 | ⚠ por unidad (la calculadora pide cajas de 100) |
| `cinta-juntas` | `GN60272` Buildco cinta de papel 2" × 76 m | $4,58 | ⚠ 76 m (la calculadora supone 75) |
| `masilla` | `RAMA0006` Magic Gypsum pasta para drywall galón | $9,12 | ⚠ confirmar kilos por galón |
| `cuchara` | `GN03409` Cuchara para albañil punta cuadrada 9" | $9,15 | |
| `llana` | `GN00300` Palustra llana plástica para graneado | $5,80 | ⚠ no hay llana lisa de acero |
| `balde` | `PRLF0073` Prolife tobo para albañil plástico | $8,15 | |
| `carretilla` | `MULTP005` Carretilla construcción gris | $98,09 | `HERRA0010` Herragro 65 L ($132,04) |
| `pala` | `BLLT0128` Bellota/Herragro pala calidad | $21,42 | |
| `nivel` | `NIKAT087` Nikato nivel de aluminio 24" | $12,89 | `GN60724` Da Hai 60 cm ($18,50) |
| `cinta-metrica` | `BRUF0525` Brufer cinta métrica 5 m × 19 mm | $3,87 | `TRUP0776` Pretul 5 m ($6,03) |
| `guantes` | `GN14750` Guantes de carnaza cortos | $4,52 | `GN03713` largos reforzados ($8,24) |
| `lentes` | `GN03721` Lentes de seguridad oscuro-transparente | $3,11 | `PRLF0036` Prolife Smoke ($3,43) |
| `segueta` | `BRUF0168` Brufer arco de segueta tubular | $7,99 | `NIKAT032` Nikato 12" ($17,15) |
| `rodillo` | `GN00188` Set de bandeja y rodillo 9" económico | $7,42 | ⚠ es un set; no hay "rodillo antigota" suelto |
| `brocha` | `JABAL024` Brocha 2" económica | $3,19 | |
| `bandeja` | `GN12764` Bandeja plástica para rodillo | $2,49 | |
| `cinta-enmascarar` | `CELV0006` Tirro papel 1" | $2,92 | |
| `espatula` | `LBS0108` Lobster espátula 4" mango de madera | $3,28 | `BRUF0208` Brufer 4" ($2,49) |
| `taladro` | `NIKAT081` Nikato taladro percutor 1/2" 600 W | $67,77 | `CAT0042` Wesco 550 W ($50,18), `BSC0165` Bosch ($140,36) |
| `escalera` | `ALD0030` Aladino escalera plataforma doméstica 3 tramos | $91,88 | ⚠ confirmar si es de aluminio; `ALD0021` 2 tramos ($70,36) |

Al aplicarlos: la prueba "todo material y herramienta apunta a un producto que existe" usa la muestra real
`lib/__tests__/datos/muestraSaint.json`: agrega ahí los productos elegidos (o ajusta la prueba).

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

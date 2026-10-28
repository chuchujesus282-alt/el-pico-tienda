# Eventos para análisis

Qué miran, buscan y guardan los clientes, para decidir qué productos traer y cómo ordenar la tienda.
Responsable: persona A. Código en `lib/eventos/` y `components/eventos/`. Tablas en Neon (`lib/db/esquema.ts`,
migración `drizzle/0002_eventos.sql`).

## Qué se registra

| Tipo (`tipo_evento`) | Cuándo | Qué guarda |
|---|---|---|
| `producto_visto` | Se abre la página de un producto | `producto_id` (máx. 1 vez cada 30 min por visitante y producto) |
| `categoria_vista` | Se abre una categoría | `categoria` (slug) y `subcategoria` si está en un nivel del árbol: el **código de la instancia de Saint** (cualquier nivel; desde el 2026-10-28). Máx. 1 vez cada 30 min por visitante, categoría y subcategoría; pasar de página no cuenta |
| `busqueda` | Se abre `/buscar?q=` (no cada letra del buscador) | `termino` (minúsculas, máx. 60) y `resultados` (0 = sin resultados; llega hasta 60, el tope de `buscar()`: 60 = "60 o más") |
| `carrito` | Se agrega un producto al carrito | `producto_id` (cada vez que se agrega) |
| `favorito` | Se marca un favorito (no al quitarlo) | `producto_id` |
| `pedido_enviado` | **Fase 5** (aún no se acepta) | — |

Todos llevan `visitante` (el código de la cookie) y `created_at` (**UTC**; las consultas lo pasan a Caracas).

## Cómo funciona

- **Navegador** (`lib/eventos/cliente.ts`): `registrarEvento({...})` junta los eventos y los manda 2 s después del
  último (o al juntar 10) con `sendBeacon`; al cerrar o esconder la pestaña los manda de una vez. Nunca lanza ni hace
  esperar; si falla, se pierden esos eventos y nada más. No manda nada si el navegador es un robot o está manejado por
  un programa (`navigator.webdriver`). Para colgarlo en una página: `<RegistrarEvento evento={...} />`
  (`components/eventos/RegistrarEvento.tsx`, no dibuja nada).
- **Servidor** (`app/api/eventos/route.ts` + `lib/eventos/servidor.ts`): responde 204 al instante y trabaja después
  (`after()`): descarta robots y envíos de otros sitios, limpia cada evento (`lib/eventos/reglas.ts`), aplica el límite,
  comprueba que el producto o la categoría existan y guarda todo en una sola consulta.
- **Visitante**: cookie `el-pico-visitante` con un UUID al azar (`httpOnly`, `SameSite=Lax`, 1 año). La crea
  `/api/eventos` con el primer evento. **Al cerrar sesión se borra** (la próxima persona en esa computadora empieza
  con otro código).
- **Cuenta**: al entrar (y en cada visita con sesión) `lib/cuenta.ts` anota en `visitante_cuenta` que ese visitante es
  de esa cuenta. Así quedan unidos sus eventos de antes y de después de entrar, en todos sus dispositivos.

## Límites y espacio

- Por envío: máx. 20 eventos y 8 KB. Por visitante: **300 eventos por hora**. Por red (la IP convertida en un código
  irreversible con el secreto del sitio; la IP no se guarda): **3.000 por hora**, por las IP compartidas de las
  operadoras. Lo que pasa del límite se descarta en silencio (cuenta en `limite_intento`, claves `eventos:…`).
- Cada evento ocupa ~100–130 bytes con sus índices: ~130 MB por millón.
- **Retención**: se guardan 12 meses completos (en hora de Caracas). Lo anterior se **resume por mes** en
  `resumen_evento_mes` (producto/categoría, tipo, mes, cantidad) y `resumen_busqueda_mes` (término, mes, cantidad,
  sin resultados) — **esos resúmenes se guardan para siempre** — y se borra. Lo hace `/api/eventos` en segundo plano,
  como mucho cada 30 minutos por servidor, en tandas de 5.000 (sin cron: el plan Hobby de Vercel solo corre uno al
  día). Resumir y borrar es UNA consulta: cada evento se cuenta una sola vez aunque dos servidores lo hagan a la vez.

## Privacidad

En los eventos NO se guardan IP, navegador, nombre, correo ni teléfono. Las búsquedas que parecen un correo, un
teléfono o una cédula no se guardan (`pareceDatoPersonal`). **La política de privacidad (fase 6) debe mencionar la
cookie `el-pico-visitante`** (para qué es, que no identifica a la persona, que dura 1 año y se cambia al cerrar sesión)
y lo que se guarda en el navegador (`el-pico:perfil` para "Te puede interesar", `el-pico:eventos-recientes`).

## Consultas de ejemplo (en hora de Caracas)

Se corren en el editor SQL de Neon (rama `main` para los datos reales). `created_at` está en UTC: siempre se pasa a
Caracas con `created_at at time zone 'America/Caracas'`.

**¿Qué buscan los clientes y no encuentran?** (productos que quizá conviene traer o nombrar distinto; últimos 30 días)
```sql
select termino,
       count(*) as veces,
       max(created_at at time zone 'America/Caracas') as ultima_vez
from evento
where tipo = 'busqueda' and resultados = 0
  and created_at > now() - interval '30 days'
group by termino
order by veces desc
limit 50;
```

**¿Qué es lo más buscado?** (últimos 30 días, con cuántas veces no hubo resultados)
```sql
select termino,
       count(*) as veces,
       count(*) filter (where resultados = 0) as sin_resultados
from evento
where tipo = 'busqueda' and created_at > now() - interval '30 days'
group by termino
order by veces desc
limit 50;
```

**¿Qué productos miran mucho pero casi nadie agrega al carrito?** (precio, foto o descripción a revisar; 30 días)
```sql
select producto_id,
       count(*) filter (where tipo = 'producto_visto') as vistas,
       count(*) filter (where tipo = 'carrito') as al_carrito,
       round(100.0 * count(*) filter (where tipo = 'carrito')
             / nullif(count(*) filter (where tipo = 'producto_visto'), 0), 1) as porcentaje
from evento
where tipo in ('producto_visto', 'carrito') and created_at > now() - interval '30 days'
group by producto_id
having count(*) filter (where tipo = 'producto_visto') >= 20
order by porcentaje asc nulls first, vistas desc
limit 50;
```

**¿Qué categorías y subcategorías visitan más?** (30 días; `subcategoria` vacía = la categoría sin filtro)
```sql
select categoria,
       coalesce(subcategoria, '') as subcategoria,
       count(*) as visitas
from evento
where tipo = 'categoria_vista' and created_at > now() - interval '30 days'
group by 1, 2
order by visitas desc;
```

**¿A qué hora y qué día de la semana entran más?** (para saber cuándo atender el WhatsApp o publicar ofertas)
```sql
select (array['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'])
         [extract(isodow from created_at at time zone 'America/Caracas')::int] as dia,
       extract(hour from created_at at time zone 'America/Caracas')::int as hora,
       count(distinct visitante) as visitantes
from evento
where created_at > now() - interval '30 days'
group by 1, 2, extract(isodow from created_at at time zone 'America/Caracas')
order by extract(isodow from created_at at time zone 'America/Caracas'), hora;
```

**¿Cómo se compara diciembre de este año con los anteriores?** (temporadas: junta el resumen de los meses ya
borrados con el detalle de los últimos 12 meses; cambia `12` por el mes que quieras)
```sql
with detalle as (
  select date_trunc('month', created_at at time zone 'America/Caracas')::date as mes, tipo, count(*) as cantidad
  from evento
  group by 1, 2
), todo as (
  select mes, tipo, sum(cantidad) as cantidad from resumen_evento_mes group by 1, 2
  union all
  select mes, tipo, cantidad from detalle
)
select extract(year from mes)::int as anio,
       sum(cantidad) filter (where tipo = 'producto_visto') as productos_vistos,
       sum(cantidad) filter (where tipo = 'carrito') as agregados_al_carrito,
       sum(cantidad) filter (where tipo = 'favorito') as favoritos
from todo
where extract(month from mes) = 12
group by 1
order by 1;
```

**¿Qué productos se agregan más al carrito por mes, en toda la historia?** (resumen + detalle)
```sql
with todo as (
  select mes, producto_id, cantidad from resumen_evento_mes where tipo = 'carrito'
  union all
  select date_trunc('month', created_at at time zone 'America/Caracas')::date, producto_id, 1
  from evento where tipo = 'carrito'
)
select to_char(mes, 'YYYY-MM') as mes, producto_id, sum(cantidad) as veces
from todo
group by 1, 2
order by 1 desc, veces desc;
```

**¿Cuántos visitantes tienen cuenta?** (últimos 30 días)
```sql
select count(distinct e.visitante) as visitantes,
       count(distinct e.visitante) filter (where vc.user_id is not null) as con_cuenta
from evento e
left join visitante_cuenta vc on vc.visitante = e.visitante
where e.created_at > now() - interval '30 days';
```

**¿Cuánto espacio ocupan los eventos?** (Neon gratis: 1 GB en total)
```sql
select relname as tabla, pg_size_pretty(pg_total_relation_size(relid)) as tamano
from pg_catalog.pg_statio_user_tables
where relname in ('evento', 'visitante_cuenta', 'resumen_evento_mes', 'resumen_busqueda_mes')
order by pg_total_relation_size(relid) desc;
```

## Agregar un evento nuevo

1. Si es un tipo nuevo: agrégalo a `TIPOS_EVENTO` (`lib/eventos/reglas.ts`) y al enum `tipoEvento`
   (`lib/db/esquema.ts`), y genera la migración (`npm run db:generate`). Define sus campos en `Evento` y en
   `limpiarEvento`, y si se cuenta una sola vez cada 30 minutos, en `SIN_REPETIR`/`claveSinRepetir`.
2. En la página o el componente: `registrarEvento({...})` o `<RegistrarEvento evento={...} />`. Nada más: no hay que
   tocar `/api/eventos`.
3. Pruebas en `lib/__tests__/eventos.test.ts`.

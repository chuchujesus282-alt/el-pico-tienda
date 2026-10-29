# Cuentas: tareas a mano (borrar, corregir, ver datos de un cliente)

Para el dueño de la tienda (persona A). Se hacen en el **SQL Editor de Neon, rama `main`** (los datos reales).
La política de privacidad (`/privacidad`) promete responder en **un máximo de 15 días hábiles**.

Antes de tocar nada, confirma que quien lo pide es el dueño de la cuenta: que escriba desde el correo o el teléfono
que tiene registrados (consulta 1).

## 1. Ver los datos de un cliente

Cambia el correo y corre:

```sql
select u.id, u.name as nombre, u.email as correo, u.email_verified as correo_confirmado,
       u.created_at at time zone 'America/Caracas' as creada,
       p.tipo_persona, p.nombre as nombre_factura, p.documento, p.telefono,
       (select count(*) from direccion d where d.user_id = u.id) as direcciones,
       (select count(*) from pedido x where x.user_id = u.id) as pedidos,
       (select string_agg(a.provider_id, ', ') from account a where a.user_id = u.id) as entra_con
from "user" u
left join perfil p on p.user_id = u.id
where u.email = 'cliente@ejemplo.com';
```

`entra_con`: `credential` = correo y contraseña; `google` = Google.

## 2. Corregir datos

Casi todo lo corrige el cliente en **Mi cuenta** (datos para la factura y direcciones). Si no puede, por ejemplo el
nombre de la cuenta:

```sql
update "user" set name = 'Nombre Correcto', updated_at = now() where email = 'cliente@ejemplo.com';
```

## 3. Borrar una cuenta y todo lo que tiene

Un solo `delete` borra en cascada: sesiones, formas de entrar (contraseña o Google), perfil, direcciones, favoritos,
carrito, pedidos (con sus productos) y el vínculo con sus registros de uso. Los registros de uso (`evento`) quedan,
pero sin nada que los una a la persona (solo un código al azar).

```sql
-- 1) Mira primero qué se va a borrar (consulta 1). 2) Borra:
delete from "user" where email = 'cliente@ejemplo.com' returning id, email;
-- 3) Enlaces de correo pendientes (cambiar contraseña) de esa cuenta, si quedara alguno:
delete from verification where value = '<id que devolvió el paso 2>';
```

Después, avísale al cliente por el mismo medio que lo pidió. Si vuelve a registrarse con ese correo, empieza de cero.

## 4. Si cambia lo que se guarda

Si una función nueva guarda datos personales (otra tabla con `user_id`), agrégale `onDelete: "cascade"` en
`lib/db/esquema.ts` (así el paso 3 la cubre) y actualiza `/privacidad` (`app/privacidad/page.tsx`, con su fecha).

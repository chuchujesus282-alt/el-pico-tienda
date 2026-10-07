# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Tres públicos, en Caracas:
- **Hogares y particulares:** reparan o mejoran su casa (una llave, pintura, un breaker). Compras pequeñas, a menudo urgentes; no siempre saben el nombre técnico de lo que necesitan.
- **Maestros de obra y técnicos** (plomeros, electricistas, albañiles): compran seguido y saben exactamente qué piden (código, medida, marca). Quieren encontrar rápido y pedir sin fricción.
- **Empresas y constructoras:** compras grandes o recurrentes para obras, condominios o mantenimiento.

## Product Purpose
Tienda en línea de Centro Ferretero El Pico. Permite ver el catálogo por categorías con precios referenciales en USD, armar un pedido en un carrito y enviarlo por WhatsApp a la tienda, donde se confirma disponibilidad y forma de pago y se cierra la venta. Éxito: pedidos claros que llegan por WhatsApp listos para atender, y clientes que encuentran lo que buscan sin tener que llamar.

## Positioning
El Pico es la ferretería de la zona con surtido amplio (todo en un solo lugar), atención cercana que asesora sobre qué comprar, y trayectoria que los vecinos conocen y en la que confían. La web extiende ese trato: no sustituye la conversación, la prepara. No se posiciona por precio.

## Operating Context
- El cliente navega el catálogo, agrega productos y envía el pedido por WhatsApp (`wa.me` con el mensaje armado: cantidades, nombres, códigos y total referencial). La venta se cierra en la conversación.
- Los productos vienen del sistema de la tienda (SQL Server) a través de una API de solo lectura detrás de un túnel de Cloudflare; mientras no esté conectada se usan datos de prueba (`lib/mock/`).
- Los nombres de producto llegan en MAYÚSCULAS tal como están en el sistema; cada producto tiene un código.
- Dos personas desarrollan en paralelo (página principal y página de categoría) sobre componentes compartidos.

## Capabilities and Constraints
- **Fase 1:** catálogo por categorías con precios y carrito que NO cobra; el cierre es por WhatsApp.
- No hay inventario en esta fase: nunca mostrar "disponible" ni "agotado".
- Precios en USD, siempre "referenciales"; formato venezolano (`$ 1.289,50`).
- Sin cuentas de cliente todavía ("Mi cuenta" es solo visual). Sin búsqueda funcional todavía (`/buscar` pendiente). Página de producto (`/producto/[id]`) en una fase posterior.
- Páginas informativas (Quiénes somos, Ubícanos, Horario, Cómo comprar, Contacto, Políticas) pendientes.
- Stack existente: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, desplegado en Vercel.

## Brand Commitments
- Nombre: Centro Ferretero El Pico (abreviado "El Pico"), Caracas.
- Voz: español de Venezuela, tuteando al cliente; cercana y práctica.
- Los colores de marca existentes (azul principal, rojo para la acción) están definidos en `app/globals.css` y `docs/guia-de-estilo.md` y son obligatorios.
- La distribución se inspira en tienda.campienlinea.com (capturas en `docs/referencia/`), pero nunca se copia su logo, imágenes, banners, textos ni nombre.

## Evidence on Hand
- **Logo oficial:** `public/logo-el-pico.webp` (rojo, texto calado; RIF J-30440607-0 en el borde). Sobre fondos azules va en placa blanca (`components/layout/Logo.tsx`); el favicon usa solo las montañas (`app/icon.png`).
- **Existen, aún no están en el repo:** fotos de productos, y dirección, horario y teléfono reales de la tienda.
- **No existen:** fotos de la tienda o del equipo, testimonios, reseñas, cifras de clientes ni años de trayectoria concretos. No inventarlos.
- Las marcas de los datos de prueba (`lib/mock/`) son ficticias.

## Product Principles
1. **La web prepara la conversación, no la reemplaza.** Todo flujo termina en un pedido claro por WhatsApp.
2. **Encontrar rápido para el que sabe, orientar al que no.** El técnico busca por código o medida; el particular necesita categorías y nombres claros.
3. **Honestidad sobre la fase.** Precios referenciales, sin promesas de existencia, sin pagos en línea.
4. **Confianza de barrio.** Surtido, asesoría y trayectoria se transmiten con datos reales de la tienda, nunca con pruebas inventadas.

## Accessibility & Inclusion
Mobile-first por regla del proyecto (se revisa siempre en 375, 768 y 1280 px).

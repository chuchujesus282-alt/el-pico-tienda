import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Ban, Lock, ShieldCheck, Smartphone } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { TIENDA } from "@/lib/tienda";

// Políticas de privacidad — responsable: persona A (rama `politicas-privacidad`).
// Describe lo que la tienda REALMENTE hace con los datos. Si cambia cómo se recogen o usan
// (cuentas, pedidos, analítica, cookies, proveedores nuevos), actualiza este texto y la fecha.

const ACTUALIZACION = "7 de octubre de 2026";

export const metadata: Metadata = {
  title: "Políticas de privacidad",
  description: `Cómo ${TIENDA.razonSocial} recopila, usa y protege tu información personal en la tienda web.`,
};

const resumen: { icono: ReactNode; texto: string }[] = [
  { icono: <Ban className="size-5" aria-hidden />, texto: "No vendemos ni alquilamos tu información personal." },
  { icono: <Lock className="size-5" aria-hidden />, texto: "En la web no cobramos ni pedimos datos de tarjetas o claves bancarias." },
  {
    icono: <Smartphone className="size-5" aria-hidden />,
    texto: "Tu carrito y tus preferencias se guardan solo en tu navegador, no en nuestros servidores.",
  },
  { icono: <ShieldCheck className="size-5" aria-hidden />, texto: "Puedes ver, corregir o borrar tus datos cuando quieras." },
];

const secciones = [
  { id: "quienes-somos", titulo: "Quiénes somos" },
  { id: "alcance", titulo: "Alcance de esta política" },
  { id: "informacion", titulo: "Qué información recopilamos" },
  { id: "navegador", titulo: "Lo que se guarda en tu navegador" },
  { id: "uso", titulo: "Para qué usamos tu información" },
  { id: "compartir", titulo: "Con quién la compartimos" },
  { id: "estadisticas", titulo: "Información estadística" },
  { id: "conservacion", titulo: "Cuánto tiempo la guardamos" },
  { id: "derechos", titulo: "Tus derechos sobre tus datos" },
  { id: "seguridad", titulo: "Seguridad de tu información" },
  { id: "edad", titulo: "Mayoría de edad" },
  { id: "otros-sitios", titulo: "Enlaces a otros sitios" },
  { id: "cambios", titulo: "Cambios a esta política" },
  { id: "contacto", titulo: "Contacto" },
] as const;

type IdSeccion = (typeof secciones)[number]["id"];

function Seccion({ id, children }: { id: IdSeccion; children: ReactNode }) {
  const numero = secciones.findIndex((s) => s.id === id) + 1;
  const { titulo } = secciones[numero - 1];
  return (
    <section id={id} className="scroll-mt-24 space-y-3 border-t border-gris-borde pt-6 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-3 text-lg font-bold text-pico-azul md:text-xl">
        <span className="text-sm font-bold text-pico-rojo tabular-nums">{String(numero).padStart(2, "0")}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Lista({ children, numerada = false }: { children: ReactNode; numerada?: boolean }) {
  const Etiqueta = numerada ? "ol" : "ul";
  return (
    <Etiqueta className={`space-y-1.5 pl-5 marker:text-pico-rojo ${numerada ? "list-decimal" : "list-disc"}`}>{children}</Etiqueta>
  );
}

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="pt-1 font-semibold text-texto">{children}</h3>;
}

export default function PaginaPoliticasPrivacidad() {
  return (
    <Contenedor className="space-y-6 py-6 md:space-y-8 md:py-10">
      <div className="motion-safe:animate-aparecer">
        <TituloSeccion titulo="Políticas de privacidad" nivel="h1" className="mb-2" />
        <p className="text-[13px] text-gris-texto">Última actualización: {ACTUALIZACION}</p>
      </div>

      {/* Resumen en lenguaje sencillo. */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.map(({ icono, texto }) => (
          <li
            key={texto}
            className="flex items-start gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 text-sm text-texto shadow-tarjeta"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">
              {icono}
            </span>
            {texto}
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Índice: arriba en móvil, fijo a la izquierda en escritorio. */}
        <nav aria-label="Contenido" className="lg:sticky lg:top-6 lg:self-start">
          <details className="group rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta lg:pointer-events-none" open>
            <summary className="cursor-pointer list-none text-sm font-bold tracking-[0.15em] text-pico-azul uppercase lg:cursor-default">
              Contenido
            </summary>
            <ol className="mt-3 space-y-1 text-sm lg:pointer-events-auto">
              {secciones.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex gap-2 rounded-boton px-2 py-1 text-gris-texto transition-colors hover:bg-gris-fondo hover:text-pico-azul"
                  >
                    <span className="w-5 shrink-0 text-pico-rojo tabular-nums">{i + 1}.</span>
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        </nav>

        <article className="space-y-6 rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 text-sm leading-relaxed text-texto shadow-tarjeta md:p-8 md:text-[15px]">
          <Seccion id="quienes-somos">
            <p>
              Para <strong>{TIENDA.nombre}</strong>, la confianza de nuestros clientes es lo más importante. Por eso cuidamos la
              información que nos compartes cuando compras con nosotros, y aquí te explicamos de forma clara qué datos
              recopilamos, para qué los usamos y cómo los protegemos.
            </p>
            <p>
              El responsable de tus datos es <strong>{TIENDA.razonSocial}</strong>, RIF {TIENDA.rif}, con domicilio en{" "}
              {TIENDA.direccion.join(", ")}, {TIENDA.ciudad}, Venezuela.
            </p>
          </Seccion>

          <Seccion id="alcance">
            <p>
              Esta política aplica a nuestra tienda web, a los pedidos que se arman en ella y se confirman por WhatsApp, y a los
              datos que nos das cuando retiras o recibes un pedido hecho por la web.
            </p>
            <p>
              Llamamos <strong>información personal</strong> a la que permite identificarte: por ejemplo, tu nombre, tu cédula o
              RIF, tu dirección, tu teléfono o tu correo electrónico.
            </p>
          </Seccion>

          <Seccion id="informacion">
            <p>Solo recopilamos lo necesario para atender tu pedido. Según cómo uses la tienda, puede ser:</p>
            <Subtitulo>Cuando creas una cuenta</Subtitulo>
            <Lista>
              <li>Tu correo electrónico y una contraseña, que se guarda protegida.</li>
              <li>
                Datos para tu factura: nombre y apellido o razón social, cédula, RIF o pasaporte, teléfono, dirección fiscal y,
                si eres empresa, si eres contribuyente especial.
              </li>
              <li>Las direcciones de entrega que guardes, con su punto de referencia para el repartidor.</li>
            </Lista>
            <Subtitulo>Cuando haces un pedido</Subtitulo>
            <Lista>
              <li>Los productos y cantidades que pides.</li>
              <li>Cómo lo retiras (en la tienda, delivery o flete) y, si hace falta, la dirección de entrega.</li>
              <li>
                El método de pago que eliges (por ejemplo, pago móvil, transferencia, Zelle o divisas). En la web{" "}
                <strong>no cobramos ni pedimos</strong> números de tarjeta, claves ni códigos bancarios.
              </li>
            </Lista>
            <Subtitulo>Cuando nos escribes por WhatsApp</Subtitulo>
            <Lista>
              <li>Tu número y nombre de WhatsApp, los mensajes de la conversación y, si nos los envías, los comprobantes de pago.</li>
            </Lista>
            <Subtitulo>Datos técnicos</Subtitulo>
            <Lista>
              <li>
                Como cualquier sitio web, el servicio que aloja la tienda registra datos técnicos de la conexión (dirección IP,
                tipo de navegador y páginas visitadas) para que la página funcione y para protegerla de abusos.
              </li>
              <li>No pedimos tu ubicación GPS ni acceso a tu cámara o micrófono.</li>
            </Lista>
          </Seccion>

          <Seccion id="navegador">
            <p>
              Para que tu experiencia sea más cómoda, guardamos algunas cosas <strong>solo en tu navegador</strong> (almacenamiento
              local de tu dispositivo). Esta información no se envía a nuestros servidores:
            </p>
            <Lista>
              <li>Tu carrito, para que no lo pierdas al cerrar la página.</li>
              <li>
                Tus preferencias para la sección “Te puede interesar”: qué productos viste, agregaste al carrito o pediste, y qué
                buscaste, con su fecha. Solo guardamos códigos de producto y palabras de búsqueda; nada que te identifique.
              </li>
            </Lista>
            <p>
              Hoy <strong>no usamos cookies de publicidad ni de rastreo</strong>. Cuando las cuentas estén disponibles,
              usaremos únicamente las cookies necesarias para mantener tu sesión iniciada.
            </p>
            <p>
              Puedes borrar todo esto cuando quieras desde la configuración de tu navegador (“Borrar datos del sitio”). La tienda
              seguirá funcionando; solo verás el carrito vacío y sugerencias generales.
            </p>
          </Seccion>

          <Seccion id="uso">
            <p>Usamos tu información solo para:</p>
            <Lista numerada>
              <li>Atender tus pedidos: confirmarte disponibilidad, precio y forma de pago por WhatsApp.</li>
              <li>Emitir tu factura con los datos fiscales que nos indiques.</li>
              <li>Coordinar el retiro en la tienda, el delivery o el flete.</li>
              <li>Crear y administrar tu cuenta.</li>
              <li>Sugerirte productos que te pueden servir, según lo que viste, buscaste o pediste.</li>
              <li>Atenderte cuando nos consultas o tienes un reclamo.</li>
              <li>Proteger la tienda y a nuestros clientes de fraudes y usos indebidos.</li>
              <li>Mejorar la tienda, con estadísticas que no te identifican.</li>
              <li>Cumplir nuestras obligaciones legales, tributarias y contractuales.</li>
            </Lista>
            <p>
              <strong>No vendemos, alquilamos ni cedemos tu información personal</strong> para que otras empresas te ofrezcan sus
              productos. Si algún día quisiéramos hacerlo, te pediremos antes tu consentimiento expreso.
            </p>
          </Seccion>

          <Seccion id="compartir">
            <p>Solo compartimos lo indispensable con quienes nos ayudan a atenderte:</p>
            <Lista>
              <li>
                <strong>WhatsApp (Meta)</strong>, cuando eliges enviarnos tu pedido o escribirnos por ese medio.
              </li>
              <li>
                <strong>Repartidores y transportistas</strong>, si pides delivery o flete: tu nombre, teléfono y dirección de
                entrega.
              </li>
              <li>
                <strong>Bancos y plataformas de pago</strong> que tú elijas (por ejemplo, Zelle, Binance o Cashea). Ellos tratan
                tus datos según sus propias políticas.
              </li>
              <li>
                <strong>El servicio que aloja nuestra página web</strong>, que procesa los datos técnicos de la conexión.
              </li>
              <li>
                <strong>Autoridades competentes</strong>, solo cuando la ley lo exija.
              </li>
            </Lista>
            <p>
              No permitimos que estos proveedores usen tu información para fines propios. Nuestra página de{" "}
              <Link href="/ubicanos" className="font-semibold text-pico-rojo hover:underline">
                Ubícanos
              </Link>{" "}
              muestra un mapa de OpenStreetMap, y si decides abrir la ruta en Google Maps, Waze o Apple Maps, esa app recibe la
              información según su propia política.
            </p>
          </Seccion>

          <Seccion id="estadisticas">
            <p>
              Podemos usar información de nuestra actividad (por ejemplo, qué productos se venden más) para tomar decisiones y
              mejorar el servicio. Esa información es <strong>anónima y general</strong>: no identifica a ningún cliente ni contiene
              datos personales.
            </p>
          </Seccion>

          <Seccion id="conservacion">
            <p>
              Guardamos tus datos mientras tengas una cuenta con nosotros o mientras los necesitemos para atender tu pedido. Las
              facturas y sus datos se conservan durante el tiempo que exigen las leyes tributarias venezolanas. Cuando ya no hagan
              falta, los eliminamos o los dejamos anónimos.
            </p>
          </Seccion>

          <Seccion id="derechos">
            <p>
              Tienes derecho a saber qué datos tenemos sobre ti, a actualizarlos, corregirlos o pedir que los eliminemos, y a
              oponerte a su uso, como lo reconoce el artículo 28 de la Constitución de la República Bolivariana de Venezuela.
            </p>
            <p>
              Para hacerlo, inicia sesión en tu cuenta y entra a la sección de tus datos: desde ahí podrás actualizarlos,
              corregirlos o eliminarlos. Los datos guardados solo en tu navegador los puedes borrar tú mismo, como se explica en
              la sección “Lo que se guarda en tu navegador”.
            </p>
          </Seccion>

          <Seccion id="seguridad">
            <p>
              Tomamos medidas razonables para proteger tu información: la página usa conexión cifrada (HTTPS), las contraseñas se
              guardan protegidas y solo las personas que necesitan tus datos para atenderte pueden verlos. Aun así, ningún sistema
              en internet es 100&nbsp;% seguro.
            </p>
            <p className="rounded-boton bg-pico-azul-claro px-4 py-3">
              <strong>Importante:</strong> El Pico <strong>nunca</strong> te pedirá por WhatsApp, correo ni llamada tus claves
              bancarias, códigos de verificación (SMS o token) ni el número completo de tu tarjeta. Si alguien te los pide en
              nuestro nombre, no los compartas.
            </p>
          </Seccion>

          <Seccion id="edad">
            <p>
              Para comprar en nuestra tienda debes ser mayor de edad. Al aceptar esta política, entendemos de buena fe que eres
              mayor de 18 años y puedes dar tu consentimiento.
            </p>
          </Seccion>

          <Seccion id="otros-sitios">
            <p>
              Nuestra tienda tiene enlaces a servicios de otras empresas (WhatsApp, apps de mapas, plataformas de pago). Al
              usarlos, se aplican sus propias políticas de privacidad, que te recomendamos revisar.
            </p>
          </Seccion>

          <Seccion id="cambios">
            <p>
              Podemos actualizar esta política cuando cambie nuestra forma de trabajar o la ley. Publicaremos aquí la nueva
              versión con su fecha de actualización. Si el cambio es importante, también te avisaremos en la tienda.
            </p>
          </Seccion>

          <Seccion id="contacto">
            <p>Si tienes preguntas sobre esta política o sobre tus datos, puedes visitarnos en:</p>
            <address className="rounded-boton bg-gris-fondo px-4 py-3 not-italic">
              <strong className="block">{TIENDA.razonSocial}</strong>
              <span className="block">RIF {TIENDA.rif}</span>
              {TIENDA.direccion.map((linea) => (
                <span key={linea} className="block">
                  {linea}
                </span>
              ))}
              <span className="block">{TIENDA.ciudad}</span>
              <Link href="/ubicanos" className="mt-1 inline-block font-semibold text-pico-rojo hover:underline">
                Ver en el mapa
              </Link>
            </address>
          </Seccion>
        </article>
      </div>
    </Contenedor>
  );
}

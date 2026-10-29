import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import IconoEscudo from "@/components/icons/pico/IconoEscudo";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
import { CONTACTO, TIENDA } from "@/lib/tienda";
import { enlaceWhatsApp } from "@/lib/whatsapp";

// Privacidad — responsable: persona A (fase 6 del plan de cuentas; reemplaza a /politicas-de-privacidad, que redirige
// aquí desde next.config.ts). Describe lo que la tienda REALMENTE hace con los datos: si cambia cómo se recogen o usan
// (cuentas, pedidos, eventos, cookies, proveedores nuevos), actualiza este texto y la fecha.
// El correo para pedir que se borren o corrijan los datos sale de CONTACTO.correo (lib/tienda.ts): mientras esté
// vacío, solo se ofrece WhatsApp.

const ACTUALIZACION = "28 de octubre de 2026";
const PLAZO_RESPUESTA = "un máximo de 15 días hábiles";

export const metadata: Metadata = {
  title: "Privacidad",
  description: `Qué datos guarda ${TIENDA.nombre}, para qué los usa, cuánto tiempo y cómo pedir que se corrijan o se borren.`,
};

const secciones = [
  { id: "responsable", titulo: "Quién cuida tus datos" },
  { id: "datos", titulo: "Qué datos guardamos" },
  { id: "navegador", titulo: "Cookies y lo que queda en tu navegador" },
  { id: "uso", titulo: "Para qué los usamos" },
  { id: "compartir", titulo: "Con quién los compartimos" },
  { id: "tiempo", titulo: "Cuánto tiempo los guardamos" },
  { id: "derechos", titulo: "Ver, corregir o borrar tus datos" },
  { id: "seguridad", titulo: "Cómo los protegemos" },
  { id: "edad", titulo: "Mayoría de edad" },
  { id: "cambios", titulo: "Cambios a esta página" },
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

function Lista({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5 marker:text-pico-rojo">{children}</ul>;
}

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="pt-1 font-semibold text-texto">{children}</h3>;
}

/** WhatsApp (y el correo, cuando exista) para pedir que se corrijan o borren los datos. */
function Contacto() {
  const whatsapp = enlaceWhatsApp("¡Hola, El Pico! Quiero hacer una solicitud sobre mis datos personales (ver, corregir o borrar).");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-boton bg-gris-fondo px-4 py-3">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-boton bg-estado-abierto px-4 text-sm font-semibold text-pico-blanco transition-colors hover:bg-estado-abierto/90"
      >
        <IconoMensaje className="size-5" />
        Escríbenos por WhatsApp
      </a>
      {CONTACTO.correo && (
        <span>
          o por correo a{" "}
          <a href={`mailto:${CONTACTO.correo}`} className="font-semibold text-pico-azul underline underline-offset-4 hover:text-pico-rojo">
            {CONTACTO.correo}
          </a>
        </span>
      )}
    </div>
  );
}

export default function PaginaPrivacidad() {
  return (
    <>
      <EncabezadoPagina
        titulo="Privacidad"
        descripcion={`Qué datos guardamos, para qué y cómo puedes pedir que se borren. Última actualización: ${ACTUALIZACION}.`}
        ruta={[{ texto: "Privacidad" }]}
        icono={IconoEscudo}
      />
      <Contenedor className="space-y-6 py-6 md:space-y-8 md:py-10">
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
            {/* En pocas palabras, para quien no quiera leer todo. */}
            <div className="rounded-tarjeta bg-pico-azul-claro p-4 text-pico-azul md:p-5">
              <p className="font-bold">En pocas palabras</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-pico-rojo">
                <li>Guardamos solo lo que hace falta para atender tus pedidos y recordar tu cuenta.</li>
                <li>No vendemos ni le pasamos tus datos a nadie para publicidad.</li>
                <li>
                  Para mejorar la tienda anotamos qué se mira y qué se busca, con un código al azar que no dice quién eres.
                </li>
                <li>Esos registros se guardan 12 meses; después solo quedan totales por mes, sin datos de nadie.</li>
                <li>Puedes pedir que corrijamos o borremos tus datos cuando quieras, y te respondemos en {PLAZO_RESPUESTA}.</li>
              </ul>
            </div>

            <Seccion id="responsable">
              <p>
                El responsable de tus datos es <strong>{TIENDA.razonSocial}</strong>, RIF {TIENDA.rif}, con domicilio en{" "}
                {TIENDA.direccion.join(", ")}, Caracas, Venezuela. En esta página le decimos &ldquo;El Pico&rdquo; o
                &ldquo;nosotros&rdquo;.
              </p>
              <p>Esta página aplica a la tienda web y a los pedidos que armas en ella y nos envías por WhatsApp.</p>
            </Seccion>

            <Seccion id="datos">
              <p>Depende de si tienes cuenta o no. Nunca te pedimos más de lo necesario.</p>
              <Subtitulo>Si tienes cuenta</Subtitulo>
              <Lista>
                <li>
                  <strong>Tu cuenta:</strong> nombre y correo. Si entras con contraseña, la guardamos cifrada: nadie puede
                  leerla, ni siquiera nosotros. Si entras con Google, Google nos da tu nombre, tu correo y tu foto, y no
                  guardamos ninguna contraseña.
                </li>
                <li>
                  <strong>Datos para tu factura:</strong> si eres persona o empresa, nombre o razón social, cédula o RIF,
                  teléfono y, si eres empresa, si eres contribuyente especial. Te los pedimos al crear la cuenta; si entraste
                  con Google, puedes darlos en Mi cuenta o, si quieres, en tu primer pedido (es opcional).
                </li>
                <li>
                  <strong>Tus direcciones de entrega:</strong> el nombre que les pones, cómo llegar y el punto que marcas en el
                  mapa.
                </li>
                <li>
                  <strong>Tus favoritos y tu carrito</strong>, para que los veas igual en el teléfono y en la computadora.
                </li>
                <li>
                  <strong>Tus pedidos:</strong> cuando tocas &ldquo;Enviar pedido por WhatsApp&rdquo;, guardamos los productos,
                  las cantidades, los precios en dólares y en bolívares con la tasa BCV de ese momento, cómo retiras, cómo
                  pagas y la dirección de entrega. Así los ves en &ldquo;Mis pedidos&rdquo; y puedes volver a pedirlos.
                </li>
              </Lista>
              <Subtitulo>Con o sin cuenta: cómo se usa la tienda</Subtitulo>
              <p>
                Anotamos qué productos y categorías se miran, qué se busca (y si encontró resultados), qué se agrega al carrito
                o a favoritos y qué productos se piden juntos. Estos registros <strong>no llevan tu nombre, tu correo, tu
                teléfono ni tu dirección IP</strong>: solo el código al azar de la cookie &ldquo;el-pico-visitante&rdquo;
                (ver el punto 3). Si buscas algo que parece un correo, un teléfono o una cédula, esa búsqueda no se guarda.
                Si tienes cuenta, esos registros quedan unidos a ella.
              </p>
              <p>
                Si no tienes cuenta, de tus pedidos <strong>solo</strong> anotamos qué productos se pidieron, sin ningún dato
                tuyo. Los datos de tu pedido los recibimos en el mensaje de WhatsApp que tú nos envías.
              </p>
            </Seccion>

            <Seccion id="navegador">
              <Subtitulo>La cookie &ldquo;el-pico-visitante&rdquo;</Subtitulo>
              <p>
                Es un código al azar (por ejemplo, &ldquo;3f9c…&rdquo;) que tu navegador guarda la primera vez que usas la
                tienda. <strong>No dice quién eres</strong>: sirve para saber que dos visitas vienen del mismo navegador y
                así entender qué se mira y qué se pide junto, para mejorar la tienda y recomendarte productos. Dura{" "}
                <strong>1 año</strong> y se cambia por uno nuevo cada vez que cierras sesión, para que la próxima persona que
                use esa computadora no quede mezclada contigo.
              </p>
              <Subtitulo>La cookie de tu sesión</Subtitulo>
              <p>
                Si entras a tu cuenta, una cookie te mantiene dentro mientras usas la tienda. Si pasas 7 días sin entrar, la
                sesión se cierra sola. Sin ella no podrías usar tu cuenta.
              </p>
              <Subtitulo>Lo que se guarda en tu navegador</Subtitulo>
              <p>Para que la tienda funcione rápido, tu navegador guarda (solo en tu equipo):</p>
              <Lista>
                <li>Tu carrito, tus favoritos y tus direcciones de entrega.</li>
                <li>
                  Lo que miraste, buscaste y pediste, para mostrarte &ldquo;Te puede interesar&rdquo;. Solo códigos de
                  productos, búsquedas y fechas: nada personal.
                </li>
                <li>Las opiniones que escribiste y la última tasa BCV que viste.</li>
                <li>
                  Notas internas: de qué cuenta es lo que hay en el navegador, qué falta por guardar en ella y qué productos o
                  categorías ya se anotaron hace poco (para no contar dos veces la misma visita).
                </li>
              </Lista>
              <p>
                Al cerrar sesión, borramos de ese navegador el carrito, los favoritos y las direcciones (siguen en tu cuenta).
                Si borras los datos de navegación de tu navegador, todo esto se borra también. No usamos cookies de
                publicidad.
              </p>
            </Seccion>

            <Seccion id="uso">
              <Lista>
                <li>
                  <strong>Atender tus pedidos:</strong> confirmarte por WhatsApp disponibilidad, total y pago, y entregarte en
                  la dirección que elegiste.
                </li>
                <li>
                  <strong>Recordar tu cuenta en cualquier dispositivo:</strong> tu carrito, favoritos, direcciones y pedidos.
                </li>
                <li>
                  <strong>Hacer tu factura</strong> con tus datos fiscales y contactarte sobre tu pedido.
                </li>
                <li>
                  <strong>Mejorar la tienda:</strong> saber qué se busca y no se encuentra, qué productos interesan y en qué
                  momentos del día se compra más.
                </li>
                <li>
                  <strong>Recomendarte productos</strong> (&ldquo;Te puede interesar&rdquo;, &ldquo;También te puede
                  servir&rdquo;) según lo que miras y lo que otros piden junto.
                </li>
                <li>
                  <strong>Cuidar tu cuenta:</strong> enviarte el correo para confirmarla o cambiar tu contraseña, y frenar
                  intentos repetidos de entrar a la fuerza.
                </li>
              </Lista>
            </Seccion>

            <Seccion id="compartir">
              <p>
                <strong>No vendemos tus datos ni se los damos a nadie para publicidad.</strong> Solo los usan, en nuestro
                nombre, los servicios con los que funciona la tienda:
              </p>
              <Lista>
                <li>
                  <strong>Vercel</strong>, donde está alojada la tienda.
                </li>
                <li>
                  <strong>Neon</strong>, donde se guarda la base de datos de las cuentas, los pedidos y los registros.
                </li>
                <li>
                  <strong>Resend</strong>, que envía los correos de la cuenta (confirmar tu correo, cambiar tu contraseña).
                </li>
                <li>
                  <strong>Google</strong>, solo si eliges entrar con tu cuenta de Google.
                </li>
              </Lista>
              <p>
                Tu pedido nos lo envías tú por <strong>WhatsApp</strong>: ese mensaje sigue las reglas de privacidad de
                WhatsApp. Lo mismo pasa si abres un enlace a otra aplicación (por ejemplo, de mapas). También podríamos
                entregar datos si una autoridad competente lo exige conforme a la ley.
              </p>
            </Seccion>

            <Seccion id="tiempo">
              <Lista>
                <li>
                  <strong>Registros de cómo se usa la tienda:</strong> 12 meses en detalle. Después se borran y solo quedan
                  totales por mes (por ejemplo, &ldquo;este producto se vio 120 veces en marzo&rdquo;), sin ningún dato de
                  nadie. Esos totales nos sirven para comparar temporadas entre años.
                </li>
                <li>
                  <strong>Tu cuenta, tus datos para la factura, tus direcciones, favoritos, carrito y pedidos:</strong>{" "}
                  mientras tengas la cuenta. Si nos pides borrarla, se borra todo eso.
                </li>
                <li>
                  <strong>Conteos para frenar abusos</strong> (por ejemplo, demasiados intentos de entrar): usan tu dirección IP
                  convertida en un código que no se puede revertir, nunca la IP tal cual, y se borran solos al poco tiempo.
                </li>
              </Lista>
            </Seccion>

            <Seccion id="derechos">
              <p>
                <strong>Ver y corregir:</strong> en{" "}
                <Link href="/mi-cuenta" className="font-semibold text-pico-azul underline underline-offset-4 hover:text-pico-rojo">
                  Mi cuenta
                </Link>{" "}
                puedes ver y cambiar tus datos para la factura, tus direcciones y tus pedidos cuando quieras.
              </p>
              <p>
                <strong>Pedir una corrección o que borremos tus datos:</strong> escríbenos y dinos qué necesitas. Para
                proteger tu cuenta, podemos pedirte que nos escribas desde el correo o el teléfono que tienes registrados. Te
                respondemos en {PLAZO_RESPUESTA}. Si borramos tu cuenta, se borran tu perfil, tus direcciones, tus favoritos,
                tu carrito y tus pedidos; los registros de uso que queden ya no tendrán nada que los una a ti.
              </p>
              <Contacto />
            </Seccion>

            <Seccion id="seguridad">
              <Lista>
                <li>La tienda funciona con conexión cifrada (https).</li>
                <li>Las contraseñas se guardan cifradas: nadie puede leerlas.</li>
                <li>Limitamos los intentos para entrar, crear cuentas y pedir enlaces por correo, para frenar abusos.</li>
                <li>Solo el personal que atiende los pedidos y mantiene la tienda puede ver los datos de las cuentas.</li>
              </Lista>
              <p>
                Ningún sistema es 100&nbsp;% seguro: si notamos un problema que afecte tus datos, te avisaremos.
              </p>
            </Seccion>

            <Seccion id="edad">
              <p>
                Para comprar en la tienda debes ser mayor de 18 años. Al crear una cuenta o enviarnos un pedido, entendemos de
                buena fe que lo eres.
              </p>
            </Seccion>

            <Seccion id="cambios">
              <p>
                Si cambiamos lo que hacemos con tus datos, actualizaremos esta página y su fecha. Si el cambio es importante,
                también te avisaremos en la tienda.
              </p>
              <p className="text-gris-texto">Última actualización: {ACTUALIZACION}.</p>
            </Seccion>
          </article>
        </div>
      </Contenedor>
    </>
  );
}

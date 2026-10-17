import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import IconoBilletes from "@/components/icons/pico/IconoBilletes";
import IconoCamion from "@/components/icons/pico/IconoCamion";
import IconoEscudo from "@/components/icons/pico/IconoEscudo";
import IconoLista from "@/components/icons/pico/IconoLista";
import IconoLupa from "@/components/icons/pico/IconoLupa";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
import IconoSello from "@/components/icons/pico/IconoSello";
import IconoUsuario from "@/components/icons/pico/IconoUsuario";
import PlacaIcono from "@/components/icons/pico/PlacaIcono";
import type { ComponenteIcono } from "@/types/icono";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import { FORMAS_RETIRO, METODOS_COMBINABLES } from "@/components/finalizar-pedido/pedido";
import Boton from "@/components/ui/Boton";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import Franja from "@/components/ui/Franja";
import Revelar from "@/components/ui/Revelar";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import IconoCarrito from "@/components/icons/pico/IconoCarrito";
import IconoRayo from "@/components/icons/pico/IconoRayo";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";

// Cómo comprar — responsable: persona A (rama `como-comprar`). Explica el flujo de compra desde el punto de vista del
// cliente. Las formas de retiro y los métodos de pago salen de finalizar-pedido/pedido.ts: si cambian allá, cambian aquí.
// Si cambia el flujo (carrito, /finalizar-pedido, WhatsApp), actualiza también estos textos.

export const metadata: Metadata = {
  title: "Cómo comprar",
  description:
    "Busca tus productos, agrégalos al carrito, elige cómo retiras y cómo pagas, y envíanos tu pedido por WhatsApp. Te confirmamos disponibilidad y total.",
};

/** "En pocas palabras": lo que el cliente tiene que saber antes de empezar. */
const resumen: { icono: ComponenteIcono; texto: string }[] = [
  { icono: IconoMensaje, texto: "Tu pedido se cierra por WhatsApp: ahí te confirmamos disponibilidad y total final." },
  { icono: IconoEscudo, texto: "En la web no se cobra nada ni te pedimos datos de tarjetas o claves bancarias." },
  { icono: IconoUsuario, texto: "Por ahora no necesitas cuenta para hacer tu pedido." },
  { icono: IconoBilletes, texto: "Los precios están en dólares y son referenciales." },
];

const lista = (textos: string[]) => {
  const ultimo = textos.at(-1);
  return textos.length > 1 ? `${textos.slice(0, -1).join(", ")} o ${ultimo}` : (ultimo ?? "");
};

const pasos: { icono: ComponenteIcono; titulo: string; contenido: ReactNode }[] = [
  {
    icono: IconoLupa,
    titulo: "Busca lo que necesitas",
    contenido: (
      <>
        <p>
          Escribe en el buscador de arriba el nombre, la marca o el código del producto. Si te equivocas al escribir, te
          mostramos igual lo que quisiste decir.
        </p>
        <p>
          También puedes entrar por las categorías de la barra azul o por los círculos de <strong>Lo más buscado</strong>. Dentro
          de cada categoría filtras por tipo de producto y marca, y ordenas por precio.
        </p>
      </>
    ),
  },
  {
    icono: IconoCarrito,
    titulo: "Agrégalo al carrito",
    contenido: (
      <>
        <p>
          Toca <strong>Agregar</strong> en el producto. Si entras a su página, puedes elegir la cantidad antes de agregarlo.
        </p>
        <p>
          El número sobre el carrito te dice cuántos artículos llevas. Tu carrito queda guardado en este navegador: puedes cerrar
          la página y seguir después.
        </p>
      </>
    ),
  },
  {
    icono: IconoLista,
    titulo: "Revisa tu carrito",
    contenido: (
      <>
        <p>
          Toca el carrito para abrirlo. Ahí subes o bajas cantidades, quitas productos y ves el{" "}
          <strong>total referencial</strong>.
        </p>
        <p>
          Cuando esté todo, toca <strong>Finalizar compra</strong>.
        </p>
      </>
    ),
  },
  {
    icono: IconoCamion,
    titulo: "Elige cómo retiras y cómo pagas",
    contenido: (
      <>
        <p>
          <strong>¿Cómo retiras?</strong>
        </p>
        <ul className="space-y-1">
          {FORMAS_RETIRO.map((forma) => (
            <li key={forma.valor}>
              <strong className="text-pico-azul">{forma.etiqueta}:</strong> {forma.detalle.toLowerCase()}
            </li>
          ))}
        </ul>
        <p>Con delivery o flete, eliges la dirección de entrega.</p>
        <p>
          <strong>Método de pago:</strong> {lista(METODOS_COMBINABLES.map((m) => m.etiqueta))}. Si quieres dividir el total,
          elige <strong>Pago combinado</strong> y marca al menos dos métodos.
        </p>
      </>
    ),
  },
  {
    icono: IconoMensaje,
    titulo: "Envía tu pedido por WhatsApp",
    contenido: (
      <>
        <p>
          Cuando eliges el retiro y el pago se activa <strong>Enviar pedido por WhatsApp</strong>. Se abre WhatsApp con el
          mensaje ya escrito: cada producto con su código y cantidad, el total referencial, cómo retiras y cómo pagas.
        </p>
        <p>Solo tienes que tocar enviar.</p>
      </>
    ),
  },
  {
    icono: IconoSello,
    titulo: "Te confirmamos y pagas",
    contenido: (
      <p>
        Te respondemos por el mismo chat con la disponibilidad y el total final, y coordinamos contigo el pago y el retiro o la
        entrega. Nada se cobra hasta que lo confirmemos juntos.
      </p>
    ),
  },
];

const preguntas: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta: "¿Pago en la página?",
    respuesta:
      "No. La página solo te ayuda a armar el pedido. El pago se acuerda por WhatsApp, después de que te confirmamos disponibilidad y total.",
  },
  {
    pregunta: "¿Cómo sé si hay existencia?",
    respuesta:
      "Te lo confirmamos por WhatsApp antes de que pagues. Si algo no está disponible, te avisamos.",
  },
  {
    pregunta: "¿Los precios están en bolívares?",
    respuesta:
      "Están en dólares y son referenciales. Arriba de la página verás la tasa BCV como referencia; el total final te lo confirmamos por WhatsApp.",
  },
  {
    pregunta: "¿Necesito crear una cuenta?",
    respuesta: "Por ahora no. Puedes armar y enviar tu pedido sin iniciar sesión.",
  },
  {
    pregunta: "¿Se borra mi carrito al enviar el pedido?",
    respuesta: (
      <>
        No, queda guardado en este navegador por si quieres repetir o cambiar algo. Si quieres empezar de cero, abre el carrito y
        toca <strong>Vaciar</strong>.
      </>
    ),
  },
  {
    pregunta: "¿Dónde retiro mi pedido?",
    respuesta: (
      <>
        En la tienda, en Fila de Mariches.{" "}
        <Link href="/ubicanos" className="font-semibold text-pico-rojo hover:underline">
          Mira cómo llegar
        </Link>{" "}
        y{" "}
        <Link href="/horario" className="font-semibold text-pico-rojo hover:underline">
          nuestro horario
        </Link>
        .
      </>
    ),
  },
];

export default function PaginaComoComprar() {
  return (
    <>
      <EncabezadoPagina
        titulo="Cómo comprar"
        descripcion="Arma tu pedido en la web, elige cómo lo retiras y cómo pagas, y nos lo envías por WhatsApp. Así de fácil."
        ruta={[{ texto: "Cómo comprar" }]}
        icono={IconoCarrito}
      />

      <Franja compacta>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resumen.map(({ icono: Icono, texto }, i) => (
            <li key={texto}>
              <Revelar retraso={i * 80} className="grupo-icono flex h-full items-start gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 text-sm text-texto shadow-tarjeta">
                <PlacaIcono tamano="sm">
                  <Icono />
                </PlacaIcono>
                {texto}
              </Revelar>
            </li>
          ))}
        </ul>
      </Franja>

      <Franja tono="blanco">
        <TituloSeccion titulo="Paso a paso" />
        <ol className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {pasos.map(({ icono: Icono, titulo, contenido }, i) => (
            <li key={titulo}>
              <Revelar
                retraso={(i % 3) * 100}
                className="grupo-icono flex h-full flex-col gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-rojo font-titulo text-lg font-bold text-pico-blanco tabular-nums">
                    {i + 1}
                  </span>
                  <h3 className="flex-1 text-lg font-bold text-pico-azul">{titulo}</h3>
                  <Icono className="size-8 text-pico-azul" />
                </div>
                <div className="space-y-2 text-sm leading-relaxed text-texto">{contenido}</div>
              </Revelar>
            </li>
          ))}
        </ol>
      </Franja>

      <Franja>
        <TituloSeccion titulo="Atajos para comprar más rápido" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <TarjetaInfo icono={<IconoRayo className="size-6" />} titulo="Comprar ahora">
            <p className="text-sm leading-relaxed text-texto">
              ¿Solo necesitas un producto? En su página toca <strong>Comprar ahora</strong> y vas directo a elegir retiro y pago
              con ese producto. Tu carrito no se toca.
            </p>
          </TarjetaInfo>
          <TarjetaInfo icono={<IconoCalculadora className="size-6" />} titulo="Calculadoras de proyectos">
            <p className="text-sm leading-relaxed text-texto">
              ¿Vas a levantar una pared, pintar o vaciar una losa? Indica las medidas y te decimos qué materiales y cuántos
              necesitas. Con <strong>Agregar todo al carrito</strong> los sumas de una vez.
            </p>
            <Link href={RUTA_CALCULADORAS} className="mt-auto text-sm font-semibold text-pico-rojo hover:underline">
              Ver las calculadoras
            </Link>
          </TarjetaInfo>
        </div>
      </Franja>

      <Franja tono="blanco">
        <TituloSeccion titulo="Preguntas frecuentes" />
        <div className="grid gap-3 lg:grid-cols-2">
          {preguntas.map(({ pregunta, respuesta }) => (
            <details
              key={pregunta}
              className="group rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta open:border-pico-azul/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-semibold text-pico-azul [&::-webkit-details-marker]:hidden">
                {pregunta}
                <ChevronDown className="size-5 shrink-0 text-pico-rojo transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-texto">{respuesta}</p>
            </details>
          ))}
        </div>
      </Franja>

      <Franja compacta>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-bold text-pico-azul md:text-2xl">¿Listo para armar tu pedido?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Boton href="/">Ver productos</Boton>
            <Boton
              href={enlaceWhatsApp("¡Hola, El Pico! Tengo una duda sobre cómo comprar.")}
              target="_blank"
              rel="noopener noreferrer"
              variante="secundario"
              className="grupo-icono"
            >
              <IconoMensaje className="size-5" />
              Escríbenos por WhatsApp
            </Boton>
          </div>
        </div>
      </Franja>
    </>
  );
}

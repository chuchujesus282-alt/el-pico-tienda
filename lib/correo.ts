import "server-only";

// ÚNICA puerta de salida de los correos de la tienda (verificar el correo, recuperar la contraseña, avisos de cuenta).
// - Con RESEND_API_KEY: se envían de verdad por Resend (API HTTP, sin librería), desde CORREO_REMITENTE o, si falta,
//   desde no-responder@centroferreteroelpico.com (dominio verificado en Resend).
// - Sin ella, en la computadora y en las versiones de prueba de Vercel: el correo se escribe en la consola
//   (o en los registros de la función, en Vercel).
// - Sin ella, en producción: no hay forma de entregar el enlace, así que lo que depende del correo (registro con
//   contraseña, recuperarla) se apaga solo; ver `correosDisponibles()`. Es una red de seguridad: con la clave
//   cargada en Vercel, todo funciona.

const clave = process.env.RESEND_API_KEY;
const remitente = process.env.CORREO_REMITENTE || "Centro Ferretero El Pico <no-responder@centroferreteroelpico.com>";
const conResend = Boolean(clave);
const enProduccion = process.env.VERCEL_ENV === "production";

/** ¿Hay cómo hacerle llegar un enlace al cliente? (Resend, o la consola fuera de producción.) */
export function correosDisponibles(): boolean {
  return conResend || !enProduccion;
}

export type Correo = {
  para: string;
  asunto: string;
  /** Texto corto que los programas de correo muestran junto al asunto, antes de abrirlo. */
  vistaPrevia: string;
  titulo: string;
  /** El primero es el saludo ("Hola, María:"). */
  parrafos: string[];
  boton?: { texto: string; url: string };
  /** Línea pequeña debajo del botón (ej. "El enlace vale por 24 horas."). */
  nota?: string;
  /** Al final, separado (ej. "Si no fuiste tú, ignora este mensaje."). */
  pie?: string;
};

const escapar = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Colores de la tienda escritos a mano (los correos no leen el CSS): pico-azul, pico-azul-oscuro, pico-rojo, azul claro.
const AZUL = "#0c2d4e";
const AZUL_OSCURO = "#071d33";
const ROJO = "#c4161c";
const AZUL_CLARO = "#e7eef5";
const GRIS = "#5b6b7c";
const LETRA = "Arial,Helvetica,sans-serif";
const LETRA_TITULO = "'Chakra Petch',Arial,Helvetica,sans-serif";
const EMPRESA = "Centro Ferretero El Pico, C.A. · RIF J-30440607-0 · Caracas, Venezuela";

// El logo se carga desde el sitio publicado (public/correo/logo-el-pico.png: variante para fondo oscuro, PNG a 480 px
// para verse nítido a 240). Siempre desde producción, también en pruebas: los programas de correo no ven localhost.
// VERCEL_PROJECT_PRODUCTION_URL pasa sola a centroferreteroelpico.com cuando se conecte el dominio.
const LOGO = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "el-pico-tienda.vercel.app"}/correo/logo-el-pico.png`;

/** HTML de tabla, con estilos en línea: es lo único que respetan Gmail, Outlook y los correos del teléfono. */
export function htmlCorreo({ asunto, vistaPrevia, titulo, parrafos, boton, nota, pie }: Correo): string {
  const parrafo = (texto: string) =>
    `<p style="margin:0 0 16px;font-family:${LETRA};font-size:16px;line-height:1.6;color:${AZUL}">${escapar(texto)}</p>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${escapar(asunto)}</title>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${AZUL_CLARO}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapar(vistaPrevia)}&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${AZUL_CLARO}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
  <tr><td bgcolor="${AZUL}" style="background:${AZUL};background-image:linear-gradient(135deg,${AZUL},${AZUL_OSCURO});border-radius:14px 14px 0 0;padding:26px 32px">
    <img src="${LOGO}" width="240" height="47" alt="Centro Ferretero El Pico" style="display:block;border:0;font-family:${LETRA};font-size:18px;font-weight:bold;color:#ffffff">
  </td></tr>
  <tr><td bgcolor="${ROJO}" style="background:${ROJO};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>
  <tr><td bgcolor="#ffffff" style="background:#ffffff;padding:36px 32px 12px">
    <h1 style="margin:0 0 20px;font-family:${LETRA_TITULO};font-size:26px;line-height:1.25;font-weight:700;color:${AZUL}">${escapar(titulo)}</h1>
    ${parrafos.map(parrafo).join("\n    ")}
  </td></tr>
  ${
    boton
      ? `<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:8px 32px 8px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td bgcolor="${ROJO}" style="border-radius:8px;background:${ROJO}">
        <a href="${escapar(boton.url)}" style="display:inline-block;padding:15px 30px;font-family:${LETRA};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px">${escapar(boton.texto)}</a>
      </td>
    </tr></table>
    ${nota ? `<p style="margin:14px 0 0;font-family:${LETRA};font-size:14px;line-height:1.5;color:${GRIS}">${escapar(nota)}</p>` : ""}
  </td></tr>
  <tr><td bgcolor="#ffffff" style="background:#ffffff;padding:16px 32px 0">
    <p style="margin:0;font-family:${LETRA};font-size:12px;line-height:1.5;color:${GRIS}">¿El botón no funciona? Abre <a href="${escapar(boton.url)}" style="color:${GRIS};text-decoration:underline">este enlace</a>.</p>
  </td></tr>`
      : ""
  }
  <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:0 0 14px 14px;padding:24px 32px 32px">
    ${
      pie
        ? `<p style="margin:0;padding-top:20px;border-top:1px solid ${AZUL_CLARO};font-family:${LETRA};font-size:13px;line-height:1.5;color:${GRIS}">${escapar(pie)}</p>`
        : ""
    }
  </td></tr>
  <tr><td align="center" style="padding:24px 16px 0;font-family:${LETRA};font-size:12px;line-height:1.6;color:${GRIS}">
    ${EMPRESA}<br>
    Este es un correo automático: por favor, no lo respondas.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** Versión en texto plano (la usan algunos programas de correo y ayuda a no caer en spam). */
export function textoCorreo({ titulo, parrafos, boton, nota, pie }: Correo): string {
  return [
    titulo,
    ...parrafos,
    boton && `${boton.texto}: ${boton.url}`,
    nota,
    pie,
    `—\n${EMPRESA}\nEste es un correo automático: por favor, no lo respondas.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function enviarCorreo(correo: Correo): Promise<void> {
  if (!conResend) {
    if (enProduccion) {
      console.error(`[correo] Falta RESEND_API_KEY: no se pudo enviar "${correo.asunto}".`);
      return;
    }
    console.info(
      `\n[correo] (sin Resend: no se envía, se muestra aquí)\n  Para:   ${correo.para}\n  Asunto: ${correo.asunto}\n  ${correo.parrafos.join("\n  ")}` +
        (correo.boton ? `\n  ${correo.boton.texto}: ${correo.boton.url}` : "") +
        "\n",
    );
    return;
  }

  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: remitente,
      to: [correo.para],
      subject: correo.asunto,
      html: htmlCorreo(correo),
      text: textoCorreo(correo),
    }),
  });
  if (!respuesta.ok) {
    // No se muestra el correo del cliente en el registro de errores, solo el estado y lo que dijo Resend.
    const detalle = (await respuesta.text()).slice(0, 300);
    console.error(`[correo] Resend respondió ${respuesta.status} al enviar "${correo.asunto}": ${detalle}`);
  } else if (!enProduccion) {
    console.info(`[correo] Enviado por Resend: "${correo.asunto}".`);
  }
}

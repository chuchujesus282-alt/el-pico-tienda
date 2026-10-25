import "server-only";

// ÚNICA puerta de salida de los correos de la tienda (verificar el correo, recuperar la contraseña, avisos de cuenta).
// - Con RESEND_API_KEY y CORREO_REMITENTE: se envían de verdad por Resend (API HTTP, sin librería).
// - Sin ellas, en la computadora y en las versiones de prueba de Vercel: el enlace se escribe en la consola
//   (o en los registros de la función, en Vercel).
// - Sin ellas, en producción: no hay forma de entregar el enlace, así que lo que depende del correo (registro con
//   contraseña, recuperarla) se apaga; ver `correosDisponibles()`. Mientras tanto se entra con Google.

const clave = process.env.RESEND_API_KEY;
const remitente = process.env.CORREO_REMITENTE;
const conResend = Boolean(clave && remitente);
const enProduccion = process.env.VERCEL_ENV === "production";

/** ¿Hay cómo hacerle llegar un enlace al cliente? (Resend, o la consola fuera de producción.) */
export function correosDisponibles(): boolean {
  return conResend || !enProduccion;
}

type Correo = {
  para: string;
  asunto: string;
  /** Primer párrafo, en texto plano. */
  texto: string;
  boton?: { texto: string; url: string };
  /** Línea pequeña al final (ej. "Si no fuiste tú, ignora este correo."). */
  pie?: string;
};

const escapar = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Colores escritos a mano: los correos no leen el CSS de la tienda. Son los del logo (pico-azul, pico-rojo).
function html({ asunto, texto, boton, pie }: Correo): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;color:#0c2d4e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td style="font-size:13px;font-weight:bold;letter-spacing:.08em;color:#c4161c">CENTRO FERRETERO EL PICO</td></tr>
<tr><td style="padding-top:12px;font-size:22px;font-weight:bold">${escapar(asunto)}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.5">${escapar(texto)}</td></tr>
${
  boton
    ? `<tr><td style="padding-top:24px"><a href="${escapar(boton.url)}" style="display:inline-block;background:#c4161c;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:8px">${escapar(boton.texto)}</a></td></tr>
<tr><td style="padding-top:16px;font-size:12px;color:#5b6b7c;word-break:break-all">Si el botón no abre, copia este enlace: ${escapar(boton.url)}</td></tr>`
    : ""
}
${pie ? `<tr><td style="padding-top:24px;font-size:12px;color:#5b6b7c">${escapar(pie)}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}

export async function enviarCorreo(correo: Correo): Promise<void> {
  if (!conResend) {
    if (enProduccion) {
      console.error(`[correo] Falta RESEND_API_KEY / CORREO_REMITENTE: no se pudo enviar "${correo.asunto}".`);
      return;
    }
    console.info(
      `\n[correo] (sin Resend: no se envía, se muestra aquí)\n  Para:   ${correo.para}\n  Asunto: ${correo.asunto}\n  ${correo.texto}` +
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
      html: html(correo),
      text: [correo.texto, correo.boton && `${correo.boton.texto}: ${correo.boton.url}`, correo.pie].filter(Boolean).join("\n\n"),
    }),
  });
  if (!respuesta.ok) {
    // No se muestra el correo del cliente en el registro de errores, solo el estado.
    console.error(`[correo] Resend respondió ${respuesta.status} al enviar "${correo.asunto}".`);
  }
}

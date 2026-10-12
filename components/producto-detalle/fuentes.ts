import { Chakra_Petch } from "next/font/google";

/** Letra del rebranding (esquinas cortadas, como el logo). */
export const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Pon esta clase en el contenedor de las páginas de persona B: TODO el texto de adentro usa Chakra Petch
 * (y la clase `font-titulo` sigue funcionando). Los portales (`createPortal` al <body>) quedan fuera del
 * contenedor, así que también la necesitan.
 */
export const fuentePaginas = `${chakra.variable} ${chakra.className}`;

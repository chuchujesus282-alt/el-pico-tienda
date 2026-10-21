import { IBM_Plex_Mono } from "next/font/google";

/**
 * Letra monoespaciada de las tarjetas de categoría 3D (prototipo tarjeta-electricidad.html): textos chicos y cotas
 * del plano. Chakra Petch ya la carga app/layout.tsx para toda la tienda (variable --font-chakra).
 */
export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

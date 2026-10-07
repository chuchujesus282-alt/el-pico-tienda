import { Chakra_Petch } from "next/font/google";

/** Letra de títulos del rebranding (esquinas cortadas, como el logo). Se activa con la clase `font-titulo`. */
export const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

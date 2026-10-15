import { Chakra_Petch } from "next/font/google";

/** Letra del rebranding (esquinas cortadas, como el logo). Se aplica a TODA la tienda desde app/layout.tsx. */
export const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

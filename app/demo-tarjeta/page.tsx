import type { Metadata } from "next";
import CategoryCardElectricidad from "@/components/tarjetas-categoria/CategoryCardElectricidad";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import styles from "./demo.module.css";

// Página de prueba TEMPORAL (sin enlaces desde la tienda): muestra la tarjeta de Electricidad igual que el
// prototipo tarjeta-electricidad.html para compararlos. Pantalla completa (ver components/layout/pantallaCompleta.ts).

export const metadata: Metadata = { title: "Tarjeta Electricidad El Pico", robots: { index: false } };

export default function PaginaDemoTarjeta() {
  return (
    <div className={`${styles.pagina} ${plexMono.variable}`}>
      <main className={styles.stage}>
        <p className={styles.hint}>
          Demo para el equipo · <b>pasa el mouse</b> sobre la tarjeta (en el teléfono, tócala)
        </p>
        <CategoryCardElectricidad />
      </main>
    </div>
  );
}

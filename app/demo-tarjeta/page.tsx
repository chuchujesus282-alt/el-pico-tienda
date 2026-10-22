import type { Metadata } from "next";
import CategoryCardElectricidad from "@/components/tarjetas-categoria/CategoryCardElectricidad";
import CategoryCardPlomeria from "@/components/tarjetas-categoria/CategoryCardPlomeria";
import CategoryCardJardin from "@/components/tarjetas-categoria/CategoryCardJardin";
import CategoryCardVehiculos from "@/components/tarjetas-categoria/CategoryCardVehiculos";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import styles from "./demo.module.css";

// Página de prueba TEMPORAL (sin enlaces desde la tienda): muestra las tarjetas de categoría igual que sus prototipos
// (tarjeta-electricidad-linea.html, tarjeta-plomeria-linea.html, tarjeta-jardin-linea.html, tarjeta-vehiculos-linea.html) para compararlas. Pantalla completa (ver
// components/layout/pantallaCompleta.ts).

export const metadata: Metadata = { title: "Tarjetas de categoría El Pico", robots: { index: false } };

export default function PaginaDemoTarjeta() {
  return (
    <div className={`${styles.pagina} ${plexMono.variable}`}>
      <main className={styles.stage}>
        <p className={styles.hint}>
          Demo para el equipo · <b>pasa el mouse</b> sobre la tarjeta (en el teléfono, tócala)
        </p>
        <div className={styles.tarjetas}>
          <CategoryCardElectricidad />
          <CategoryCardPlomeria />
          <CategoryCardJardin />
          <CategoryCardVehiculos />
        </div>
      </main>
    </div>
  );
}

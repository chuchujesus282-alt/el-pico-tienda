import type { Metadata } from "next";
import CategoryCardElectricidad from "@/components/tarjetas-categoria/CategoryCardElectricidad";
import CategoryCardPlomeria from "@/components/tarjetas-categoria/CategoryCardPlomeria";
import CategoryCardJardin from "@/components/tarjetas-categoria/CategoryCardJardin";
import CategoryCardVehiculos from "@/components/tarjetas-categoria/CategoryCardVehiculos";
import CategoryCardSeguridad from "@/components/tarjetas-categoria/CategoryCardSeguridad";
import BannerTornilleria from "@/components/inicio/BannerTornilleria";
import BannerTrabajaProtegido from "@/components/inicio/BannerTrabajaProtegido";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import styles from "./demo.module.css";

// Página de prueba TEMPORAL (sin enlaces desde la tienda): muestra las tarjetas de categoría igual que sus prototipos
// (tarjeta-electricidad-linea.html, tarjeta-plomeria-linea.html, tarjeta-jardin-linea.html, tarjeta-vehiculos-linea.html, tarjeta-seguridad-industrial.html) y los banners del casco (banner-trabaja-protegido.html) y de tornillería (banner-tornilleria.html, sobre su fondo claro), a 620px como sus prototipos, para compararlos. Pantalla completa (ver
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
          <CategoryCardSeguridad />
        </div>
        <div className={styles.banner}>
          <BannerTrabajaProtegido />
        </div>
        {/* Tornillería sobre el fondo claro de su prototipo (banner-tornilleria.html), también a 620px. */}
        <div className={styles.fondoClaro}>
          <div className={styles.banner}>
            <BannerTornilleria />
          </div>
        </div>
      </main>
    </div>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cuando la API entregue URLs de imágenes, agrega aquí el dominio que las sirve.
    // Ej.: { protocol: "https", hostname: "imagenes.elpico.com", pathname: "/**" }
    remotePatterns: [],
  },
};

export default nextConfig;

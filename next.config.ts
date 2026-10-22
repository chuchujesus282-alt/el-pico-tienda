import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cuando la API entregue URLs de imágenes, agrega aquí el dominio que las sirve.
    // Ej.: { protocol: "https", hostname: "imagenes.elpico.com", pathname: "/**" }
    remotePatterns: [
      // Fotos de perfil de Google (inicio de sesión con Auth.js).
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

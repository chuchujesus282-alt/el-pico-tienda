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
  async redirects() {
    return [
      // "Plomería" pasó a llamarse "Grifería" (2026-10-28): los enlaces viejos y los buscadores llegan a la nueva.
      { source: "/categoria/plomeria", destination: "/categoria/griferia", permanent: true },
      // Fase 6: la política de privacidad se mudó a /privacidad (los enlaces viejos siguen funcionando).
      { source: "/politicas-de-privacidad", destination: "/privacidad", permanent: true },
    ];
  },
};

export default nextConfig;

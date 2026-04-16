import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Apaga el procesamiento pesado de imágenes
    unoptimized: true, 
  },
  compress: true,

  // 1. Obligamos a meter las librerías dentro
  transpilePackages: ["@libsql/client", "drizzle-orm"],

  // 2. Regla para el NUEVO motor de Next.js (Turbopack)
  turbopack: {
    resolveAlias: {
      "@libsql/client": "@libsql/client/web",
    },
  },

  // 3. Regla para el motor clásico
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias["@libsql/client"] = "@libsql/client/web";
    }
    return config;
  },
};

export default nextConfig;
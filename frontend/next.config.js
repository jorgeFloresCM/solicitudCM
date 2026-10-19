/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig = {
  // El navegador solo habla con Next (mismo origen); Next reenvía /api/* al backend NestJS.
  // Así la cookie de sesión es de primera parte y no hace falta configurar CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

module.exports = nextConfig;

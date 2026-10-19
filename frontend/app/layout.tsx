import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGI · Consejo de la Magistratura",
  description: "Sistema de Gestión de Solicitudes — Unidad de Informática",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

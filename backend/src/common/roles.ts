export const ROLES = [
  "Administrador",
  "Técnico",
  "Consulta",
  "Jefe de Sistemas",
  "Directivo",
  "Encargado",
  "Solicitante",
] as const;
export type Rol = (typeof ROLES)[number];

export const ESTADOS_BOLETA = ["Pendiente", "Asignada", "En atención", "Observada", "Resuelta"] as const;
export type EstadoBoleta = (typeof ESTADOS_BOLETA)[number];

export const PRIORIDADES = ["Alta", "Media", "Baja"] as const;

/** Usuario autenticado que se adjunta a req.user */
export interface SesionUsuario {
  id: number;
  nombre: string;
  correo: string;
  unidad: string;
  rol: Rol;
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria configurada */
export function hoyISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TZ || "America/La_Paz",
  }).format(new Date());
}

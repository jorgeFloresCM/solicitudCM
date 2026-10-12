export type Rol =
  | "Administrador"
  | "Consulta"
  | "Técnico"
  | "Jefe de Sistemas"
  | "Directivo"
  | "Encargado";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  unidad: string;
  rol: Rol;
  estado: "Activo" | "Inactivo";
}

export type EstadoBoleta =
  | "Pendiente"
  | "Asignada"
  | "En atención"
  | "Observada"
  | "Resuelta";

export type Prioridad = "Alta" | "Media" | "Baja";

export interface Boleta {
  id: string;
  solicitante: string;
  unidad: string;
  tipoError: string;
  descripcion: string;
  fecha: string;
  estado: EstadoBoleta;
  prioridad: Prioridad;
  tecnico?: string;
}

export interface Respaldo {
  id: string;
  boletaId: string;
  nombre: string;
  tipo: string;
  url: string;
  fecha: string;
}

/* ---------- Catálogos (HU-04) ---------- */
export const UNIDADES = [
  "Ventanilla de Ingreso",
  "Secretaría General",
  "Gabinete tecnico",
  "Caja",
  "Oficina de Registrador",
  "Ventanilla de entrega",
  "Unidad de Informática",
];

export const TIPOS_ERROR = [
  "Devolucion de documento",
  "Caambio de Estado",
  "Baja de documento",
  "Indexacion",
  "Impresión / periféricos",
  "Accesos y contraseñas",
  "Habilitacion de Valoradoss",
];

export const TECNICOS = ["Ing. Jhonathan Calderon", "Ing. Alex Pedrana", "Ing. Rodrigo Soto", "Ing. Mauricio Cartagena"];

export const ROLES: Rol[] = [
  "Administrador",
  "Técnico",
  "Consulta",
];

/* ---------- Datos iniciales ---------- */
export const USUARIOS_INICIAL: Usuario[] = [
  { id: 1, nombre: "María Quispe", correo: "mquispe@cmag.gov.bo", unidad: "Secretaría General", rol: "Administrador", estado: "Activo" },
  { id: 2, nombre: "Juan Pérez", correo: "jperez@cmag.gov.bo", unidad: "Unidad Financiera", rol: "Consulta", estado: "Activo" },
  { id: 3, nombre: "Ana Rojas", correo: "arojas@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico", estado: "Activo" },
  { id: 4, nombre: "Carlos Vargas", correo: "cvargas@cmag.gov.bo", unidad: "Despacho del Presidente", rol: "Directivo", estado: "Activo" },
  { id: 5, nombre: "Luis Paredes", correo: "lparedes@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Consulta", estado: "Activo" },
  { id: 6, nombre: "Elena Molina", correo: "emolina@cmag.gov.bo", unidad: "Archivo Central", rol: "Consulta", estado: "Inactivo" },
];

export const BOLETAS_INICIAL: Boleta[] = [
  { id: "BOL-2026-001", solicitante: "Juan Pérez", unidad: "DDRR quillacollo", tipoError: "Error de software / aplicación", descripcion: "El sistema SIGEP no abre en mi estación de trabajo.", fecha: "2026-10-01", estado: "Resuelta", prioridad: "Alta", tecnico: "Téc. Rojas" },
  { id: "BOL-2026-002", solicitante: "Elena Molina", unidad: "DDRR Cercado", tipoError: "Impresión / periféricos", descripcion: "La impresora multifuncional atasca papel constantemente.", fecha: "2026-10-03", estado: "Asignada", prioridad: "Media", tecnico: "Téc. Vargas" },
  { id: "BOL-2026-003", solicitante: "María Quispe", unidad: "DD Shinaota", tipoError: "Accesos y contraseñas", descripcion: "Solicito restablecimiento de contraseña de correo institucional.", fecha: "2026-10-05", estado: "Pendiente", prioridad: "Alta" },
  { id: "BOL-2026-004", solicitante: "Carlos Vargas", unidad: "DDRR Cercado", tipoError: "Problema de red o conectividad", descripcion: "Conexión WiFi intermitente en la sala de reuniones del despacho.", fecha: "2026-10-07", estado: "En atención", prioridad: "Media", tecnico: "Téc. Paredes" },
  { id: "BOL-2026-005", solicitante: "Juan Pérez", unidad: "DDRR Cercado", tipoError: "Fallo de hardware", descripcion: "El monitor no enciende, se verificó el cable de poder.", fecha: "2026-10-09", estado: "Pendiente", prioridad: "Baja" },
  { id: "BOL-2026-006", solicitante: "Elena Molina", unidad: "DDRR Punata", tipoError: "Correo electrónico", descripcion: "No llegan correos externos desde el 08/10, solo internos.", fecha: "2026-10-10", estado: "Pendiente", prioridad: "Alta" },
];

export const RESPALDOS_INICIAL: Respaldo[] = [];

/* ---------- Helpers de persistencia (localStorage, listo para migrar a API) ---------- */
export function getBoletas(): Boleta[] {
  if (typeof window === "undefined") return BOLETAS_INICIAL;
  const raw = localStorage.getItem("boletas");
  return raw ? (JSON.parse(raw) as Boleta[]) : BOLETAS_INICIAL;
}

export function saveBoletas(boletas: Boleta[]) {
  localStorage.setItem("boletas", JSON.stringify(boletas));
}

export function getRespaldos(): Respaldo[] {
  if (typeof window === "undefined") return RESPALDOS_INICIAL;
  const raw = localStorage.getItem("respaldos");
  return raw ? (JSON.parse(raw) as Respaldo[]) : RESPALDOS_INICIAL;
}

export function saveRespaldos(r: Respaldo[]) {
  localStorage.setItem("respaldos", JSON.stringify(r));
}

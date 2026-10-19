/* Tipos compartidos con la API. Los datos viven en PostgreSQL (backend NestJS); ya no hay localStorage. */

export type Rol =
  | "Administrador"
  | "Consulta"
  | "Técnico"
  | "Jefe de Sistemas"
  | "Directivo"
  | "Encargado"
  | "Solicitante";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  unidad: string;
  rol: Rol;
  estado: "Activo" | "Inactivo";
}

export type EstadoBoleta = "Pendiente" | "Asignada" | "En atención" | "Observada" | "Resuelta";

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
  tecnico: string | null;
  tecnicoId: number | null;
}

export interface Respaldo {
  id: string;
  boletaId: string;
  nombre: string;
  tipo: string;
  url: string;
  fecha: string;
}

export interface Catalogos {
  unidades: string[];
  tiposError: string[];
  tecnicos: { id: number; nombre: string }[];
  roles: Rol[];
  estados: EstadoBoleta[];
  prioridades: Prioridad[];
}

export interface Estadisticas {
  total: number;
  porEstado: Record<EstadoBoleta, number>;
  tiempoPromedioDias: number | null;
}

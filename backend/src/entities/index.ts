import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @Column({ unique: true }) correo: string;
  /** select:false → nunca sale en consultas normales; solo el login la pide explícitamente */
  @Column({ name: "password_hash", select: false }) passwordHash: string;
  @Column() unidad: string;
  @Column() rol: string;
  @Column({ default: "Activo" }) estado: string;
  @CreateDateColumn({ name: "created_at" }) createdAt: Date;
}

// Catálogos dinámicos (HU-04)
@Entity("unidades")
export class Unidad {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) nombre: string;
  @Column({ default: true }) activo: boolean;
}

@Entity("tipos_error")
export class TipoError {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) nombre: string;
  @Column({ default: true }) activo: boolean;
}

/** Contador por año para generar BOL-AAAA-NNN sin colisiones */
@Entity("secuencias")
export class Secuencia {
  @PrimaryColumn() anio: number;
  @Column({ default: 0 }) ultimo: number;
}

@Entity("boletas")
export class Boleta {
  @PrimaryColumn() id: string;
  @Column() solicitante: string;
  @Column() unidad: string;
  @Column({ name: "tipo_error" }) tipoError: string;
  @Column("text") descripcion: string;
  @Column() prioridad: string;
  @Index() @Column({ default: "Pendiente" }) estado: string;
  /** 'date' en Postgres → el driver lo entrega como string YYYY-MM-DD */
  @Index() @Column({ type: "date" }) fecha: string;
  @Column({ name: "resuelta_at", type: "timestamptz", nullable: true }) resueltaAt: Date | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt: Date;

  @Column({ name: "tecnico_id", type: "int", nullable: true }) tecnicoId: number | null;
  @ManyToOne(() => Usuario, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "tecnico_id" })
  tecnico: Usuario | null;

  @Column({ name: "creada_por_id", type: "int", nullable: true }) creadaPorId: number | null;
  @ManyToOne(() => Usuario, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "creada_por_id" })
  creadaPor: Usuario | null;
}

@Entity("respaldos")
export class Respaldo {
  /** uuid generado en la app (randomUUID): no depende de extensiones de Postgres */
  @PrimaryColumn("uuid") id: string;
  @Index() @Column({ name: "boleta_id" }) boletaId: string;
  @ManyToOne(() => Boleta, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boleta_id" })
  boleta: Boleta;
  @Column() nombre: string;
  @Column() tipo: string;
  /** Nombre del archivo en disco (generado por el servidor) */
  @Column() ruta: string;
  @Column() tamano: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt: Date;
  @Column({ name: "subido_por_id", type: "int", nullable: true }) subidoPorId: number | null;
  @ManyToOne(() => Usuario, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "subido_por_id" })
  subidoPor: Usuario | null;
}

/**
 * Historial de operaciones sobre las boletas (trazabilidad). Solo se inserta:
 * no hay rutas para modificarlo ni borrarlo. Guarda el nombre y el rol del usuario
 * en el momento de la acción, para que el registro se conserve aunque el usuario cambie.
 */
@Entity("historial_boletas")
export class HistorialBoleta {
  @PrimaryGeneratedColumn() id: number;
  @Index() @Column({ name: "boleta_id" }) boletaId: string;
  @ManyToOne(() => Boleta, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boleta_id" })
  boleta: Boleta;
  /** Registro | Asignación | Cambio de estado */
  @Column() accion: string;
  @Column({ name: "estado_anterior", type: "varchar", nullable: true }) estadoAnterior: string | null;
  @Column({ name: "estado_nuevo", type: "varchar", nullable: true }) estadoNuevo: string | null;
  @Column({ type: "text", nullable: true }) motivo: string | null;
  /** Detalle libre, por ejemplo el técnico asignado */
  @Column({ type: "varchar", nullable: true }) detalle: string | null;
  @Column({ name: "usuario_id", type: "int", nullable: true }) usuarioId: number | null;
  @Column({ name: "usuario_nombre" }) usuarioNombre: string;
  @Column({ name: "usuario_rol" }) usuarioRol: string;
  @Index() @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt: Date;
}

export const ENTITIES = [Usuario, Unidad, TipoError, Secuencia, Boleta, Respaldo, HistorialBoleta];

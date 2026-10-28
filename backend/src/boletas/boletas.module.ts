import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Between, DataSource, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Boleta, HistorialBoleta, Usuario } from "../entities";
import { CurrentUser, Roles } from "../common/auth.guard";
import { ESTADOS_BOLETA, hoyISO, PRIORIDADES, SesionUsuario } from "../common/roles";

class CrearBoletaDto {
  @IsString() @MinLength(2) solicitante: string;
  @IsString() @MinLength(1) unidad: string;
  @IsString() @MinLength(1) tipoError: string;
  @IsIn(PRIORIDADES as unknown as string[]) prioridad: string;
  @IsString() @MinLength(3) descripcion: string;
}

class ActualizarBoletaDto {
  @IsOptional() @IsInt() tecnicoId?: number;
  @IsOptional() @IsIn(ESTADOS_BOLETA as unknown as string[]) estado?: string;
  /** Obligatorio cuando el nuevo estado es "Observada" */
  @IsOptional() @IsString() @MaxLength(500) motivo?: string;
}

class FiltrosTrazabilidadDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
  @IsOptional() @IsString() boletaId?: string;
  @IsOptional() @IsString() usuario?: string;
}

function serializarHistorial(h: HistorialBoleta) {
  return {
    id: h.id,
    boletaId: h.boletaId,
    accion: h.accion,
    estadoAnterior: h.estadoAnterior,
    estadoNuevo: h.estadoNuevo,
    motivo: h.motivo,
    detalle: h.detalle,
    usuario: h.usuarioNombre,
    rol: h.usuarioRol,
    fecha: h.createdAt,
  };
}

class FiltrosDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() unidad?: string;
}

/** Forma que consume el frontend (mismos campos que el tipo Boleta) */
function serializar(b: Boleta) {
  return {
    id: b.id,
    solicitante: b.solicitante,
    unidad: b.unidad,
    tipoError: b.tipoError,
    descripcion: b.descripcion,
    fecha: b.fecha,
    estado: b.estado,
    prioridad: b.prioridad,
    tecnico: b.tecnico?.nombre ?? null,
    tecnicoId: b.tecnicoId,
  };
}

@Controller("boletas")
export class BoletasController {
  private repo = this.ds.getRepository(Boleta);
  constructor(private ds: DataSource) {}

  @Get()
  async listar(@Query() q: FiltrosDto) {
    const where: FindOptionsWhere<Boleta> = {};
    if (q.desde && q.hasta) where.fecha = Between(q.desde, q.hasta);
    else if (q.desde) where.fecha = MoreThanOrEqual(q.desde);
    else if (q.hasta) where.fecha = LessThanOrEqual(q.hasta);
    if (q.estado) where.estado = q.estado;
    if (q.unidad) where.unidad = q.unidad;

    const rows = await this.repo.find({
      where,
      relations: { tecnico: true },
      order: { fecha: "DESC", createdAt: "DESC" },
    });
    return rows.map(serializar);
  }

  /** Historial de una boleta (HU-09) */
  @Get(":id/historial")
  @Roles("Administrador", "Jefe de Sistemas", "Técnico", "Directivo")
  async historial(@Param("id") id: string) {
    if (!(await this.repo.existsBy({ id }))) throw new NotFoundException("Boleta no encontrada");
    const rows = await this.ds
      .getRepository(HistorialBoleta)
      .find({ where: { boletaId: id }, order: { createdAt: "ASC", id: "ASC" } });
    return rows.map(serializarHistorial);
  }

  /** Registro general de trazabilidad (HU-10): solo consulta, nadie lo puede editar */
  @Get("trazabilidad/registro")
  @Roles("Administrador", "Jefe de Sistemas", "Directivo")
  async trazabilidad(@Query() q: FiltrosTrazabilidadDto) {
    const qb = this.ds.getRepository(HistorialBoleta).createQueryBuilder("h").orderBy("h.createdAt", "DESC").addOrderBy("h.id", "DESC").limit(500);
    if (q.boletaId) qb.andWhere("h.boleta_id = :b", { b: q.boletaId.trim() });
    if (q.usuario) qb.andWhere("h.usuario_nombre ILIKE :u", { u: `%${q.usuario.trim()}%` });
    if (q.desde) qb.andWhere("(h.created_at AT TIME ZONE :tz)::date >= :d", { d: q.desde, tz: process.env.APP_TZ || "America/La_Paz" });
    if (q.hasta) qb.andWhere("(h.created_at AT TIME ZONE :tz)::date <= :h", { h: q.hasta, tz: process.env.APP_TZ || "America/La_Paz" });
    return (await qb.getMany()).map(serializarHistorial);
  }

  @Post()
  @Roles("Solicitante", "Encargado", "Consulta", "Técnico", "Jefe de Sistemas")
  async crear(@Body() dto: CrearBoletaDto, @CurrentUser() user: SesionUsuario) {
    const fecha = hoyISO();
    const anio = Number(fecha.slice(0, 4));

    const id = await this.ds.transaction(async (m) => {
      // INSERT .. ON CONFLICT es atómico: dos boletas simultáneas nunca obtienen el mismo número
      const [{ ultimo }] = await m.query(
        `INSERT INTO secuencias (anio, ultimo) VALUES ($1, 1)
         ON CONFLICT (anio) DO UPDATE SET ultimo = secuencias.ultimo + 1
         RETURNING ultimo`,
        [anio],
      );
      const nuevoId = `BOL-${anio}-${String(ultimo).padStart(3, "0")}`;
      await m.getRepository(Boleta).insert({
        id: nuevoId,
        solicitante: dto.solicitante.trim(),
        unidad: dto.unidad,
        tipoError: dto.tipoError,
        prioridad: dto.prioridad,
        descripcion: dto.descripcion.trim(),
        fecha,
        estado: "Pendiente",
        creadaPorId: user.id,
      });
      await m.getRepository(HistorialBoleta).insert({
        boletaId: nuevoId,
        accion: "Registro",
        estadoAnterior: null,
        estadoNuevo: "Pendiente",
        usuarioId: user.id,
        usuarioNombre: user.nombre,
        usuarioRol: user.rol,
      });
      return nuevoId;
    });
    return serializar(await this.repo.findOneOrFail({ where: { id }, relations: { tecnico: true } }));
  }

  @Patch(":id")
  @Roles("Jefe de Sistemas", "Técnico")
  async actualizar(@Param("id") id: string, @Body() dto: ActualizarBoletaDto, @CurrentUser() user: SesionUsuario) {
    const actual = await this.repo.findOneBy({ id });
    if (!actual) throw new NotFoundException("Boleta no encontrada");

    const cambios: Partial<Boleta> = {};
    let estado = dto.estado ?? actual.estado;
    const eventos: Partial<HistorialBoleta>[] = [];
    const base = { boletaId: id, usuarioId: user.id, usuarioNombre: user.nombre, usuarioRol: user.rol };

    if (dto.tecnicoId !== undefined) {
      const tec = await this.ds.getRepository(Usuario).findOneBy({ id: dto.tecnicoId, rol: "Técnico", estado: "Activo" });
      if (!tec) throw new BadRequestException("El técnico indicado no existe o no está activo");
      if (tec.id !== actual.tecnicoId) {
        cambios.tecnicoId = tec.id;
        eventos.push({ ...base, accion: "Asignación", detalle: `Técnico: ${tec.nombre}` });
      }
      // Igual que en la UI original: asignar técnico a una boleta pendiente la pasa a "Asignada"
      if (!dto.estado && actual.estado === "Pendiente") estado = "Asignada";
    }

    const motivo = dto.motivo?.trim();
    if (estado !== actual.estado) {
      // Una observación debe explicar por qué; sin motivo no se guarda nada
      if (estado === "Observada" && (!motivo || motivo.length < 3)) {
        throw new BadRequestException("Debes indicar el motivo de la observación");
      }
      cambios.estado = estado;
      cambios.resueltaAt = estado === "Resuelta" ? new Date() : null;
      eventos.push({
        ...base,
        accion: "Cambio de estado",
        estadoAnterior: actual.estado,
        estadoNuevo: estado,
        motivo: motivo || null,
      });
    }

    if (Object.keys(cambios).length) {
      await this.ds.transaction(async (m) => {
        await m.getRepository(Boleta).update(id, cambios);
        if (eventos.length) await m.getRepository(HistorialBoleta).insert(eventos);
      });
    }
    return serializar(await this.repo.findOneOrFail({ where: { id }, relations: { tecnico: true } }));
  }
}

@Module({ controllers: [BoletasController] })
export class BoletasModule {}

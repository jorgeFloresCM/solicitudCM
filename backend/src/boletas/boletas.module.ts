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
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Between, DataSource, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Boleta, Usuario } from "../entities";
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

  @Post()
  @Roles("Solicitante", "Administrador", "Encargado", "Consulta")
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
      return nuevoId;
    });
    return serializar(await this.repo.findOneOrFail({ where: { id }, relations: { tecnico: true } }));
  }

  @Patch(":id")
  @Roles("Jefe de Sistemas", "Administrador", "Técnico")
  async actualizar(@Param("id") id: string, @Body() dto: ActualizarBoletaDto) {
    const actual = await this.repo.findOneBy({ id });
    if (!actual) throw new NotFoundException("Boleta no encontrada");

    const cambios: Partial<Boleta> = {};
    let estado = dto.estado ?? actual.estado;

    if (dto.tecnicoId !== undefined) {
      const tec = await this.ds.getRepository(Usuario).findOneBy({ id: dto.tecnicoId, rol: "Técnico", estado: "Activo" });
      if (!tec) throw new BadRequestException("El técnico indicado no existe o no está activo");
      cambios.tecnicoId = tec.id;
      // Igual que en la UI original: asignar técnico a una boleta pendiente la pasa a "Asignada"
      if (!dto.estado && actual.estado === "Pendiente") estado = "Asignada";
    }

    if (estado !== actual.estado) {
      cambios.estado = estado;
      cambios.resueltaAt = estado === "Resuelta" ? new Date() : null;
    }

    if (Object.keys(cambios).length) await this.repo.update(id, cambios);
    return serializar(await this.repo.findOneOrFail({ where: { id }, relations: { tecnico: true } }));
  }
}

@Module({ controllers: [BoletasController] })
export class BoletasModule {}

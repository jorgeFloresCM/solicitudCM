import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { IsOptional, IsString } from "class-validator";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { unlink } from "fs/promises";
import { diskStorage } from "multer";
import { extname, join, resolve } from "path";
import type { Response } from "express";
import { DataSource } from "typeorm";
import { Boleta, Respaldo } from "../entities";
import { CurrentUser } from "../common/auth.guard";
import { SesionUsuario } from "../common/roles";

const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || "./uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

// Solo PDF e imágenes. Se valida el tipo MIME y la extensión.
const PERMITIDOS: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

const opcionesSubida = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    // Nombre en disco generado por el servidor: el nombre original nunca toca el sistema de archivos
    filename: (_req, file, cb) => cb(null, randomUUID() + extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) => {
    const ext = extname(file.originalname).toLowerCase();
    if (PERMITIDOS[file.mimetype]?.includes(ext)) cb(null, true);
    else cb(new BadRequestException("Solo se aceptan archivos PDF, PNG, JPG o WEBP"), false);
  },
};

class SubirDto {
  @IsString() boletaId: string;
}
class FiltroDto {
  @IsOptional() @IsString() boletaId?: string;
}

function serializar(r: Respaldo) {
  return {
    id: r.id,
    boletaId: r.boletaId,
    nombre: r.nombre,
    tipo: r.tipo,
    url: `/api/respaldos/${r.id}/archivo`, // se sirve con sesión, no hay URL pública
    fecha: new Intl.DateTimeFormat("en-CA", { timeZone: process.env.APP_TZ || "America/La_Paz" }).format(r.createdAt),
  };
}

@Controller("respaldos")
export class RespaldosController {
  private repo = this.ds.getRepository(Respaldo);
  constructor(private ds: DataSource) {}

  @Get()
  async listar(@Query() q: FiltroDto) {
    const rows = await this.repo.find({
      where: q.boletaId ? { boletaId: q.boletaId } : {},
      order: { createdAt: "DESC" },
    });
    return rows.map(serializar);
  }

  @Post()
  @UseInterceptors(FilesInterceptor("archivos", 10, opcionesSubida))
  async subir(
    @Body() dto: SubirDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: SesionUsuario,
  ) {
    if (!files?.length) throw new BadRequestException("No se recibió ningún archivo");

    const borrarSubidos = () => Promise.all(files.map((f) => unlink(f.path).catch(() => undefined)));

    const boleta = await this.ds.getRepository(Boleta).findOneBy({ id: dto.boletaId });
    if (!boleta) {
      await borrarSubidos();
      throw new NotFoundException("La boleta indicada no existe");
    }

    try {
      const creados = await this.repo.save(
        files.map((f) =>
          this.repo.create({
            id: randomUUID(),
            boletaId: boleta.id,
            // multer entrega el nombre en latin1; se reconvierte para conservar tildes y ñ
            nombre: Buffer.from(f.originalname, "latin1").toString("utf8"),
            tipo: f.mimetype,
            ruta: f.filename,
            tamano: f.size,
            subidoPorId: user.id,
          }),
        ),
      );
      return creados.map(serializar);
    } catch (e) {
      await borrarSubidos();
      throw e;
    }
  }

  @Get(":id/archivo")
  async archivo(@Param("id") id: string, @Res() res: Response) {
    const r = await this.repo.findOneBy({ id });
    if (!r) throw new NotFoundException("Respaldo no encontrado");
    const ruta = join(UPLOAD_DIR, r.ruta);
    if (!existsSync(ruta)) throw new NotFoundException("El archivo ya no está en el servidor");
    res.setHeader("Content-Type", r.tipo);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(r.nombre)}`);
    res.sendFile(ruta);
  }

  @Delete(":id")
  async eliminar(@Param("id") id: string, @CurrentUser() user: SesionUsuario) {
    const r = await this.repo.findOneBy({ id });
    if (!r) throw new NotFoundException("Respaldo no encontrado");
    // Solo el administrador, un técnico o quien lo subió pueden borrarlo
    if (!["Administrador", "Técnico"].includes(user.rol) && r.subidoPorId !== user.id) {
      throw new ForbiddenException("No puedes eliminar este respaldo");
    }
    await this.repo.delete(id);
    await unlink(join(UPLOAD_DIR, r.ruta)).catch(() => undefined);
    return { ok: true };
  }
}

@Module({ controllers: [RespaldosController] })
export class RespaldosModule {}

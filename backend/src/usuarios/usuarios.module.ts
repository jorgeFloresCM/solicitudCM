import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import * as bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { Usuario } from "../entities";
import { CurrentUser, Roles } from "../common/auth.guard";
import { ROLES, SesionUsuario } from "../common/roles";

class CrearUsuarioDto {
  @IsString() @MinLength(2) nombre: string;
  @IsEmail() correo: string;
  @IsString() @MinLength(1) unidad: string;
  @IsIn(ROLES as unknown as string[]) rol: string;
  @IsIn(["Activo", "Inactivo"]) estado: string;
  @IsString() @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" }) password: string;
}

class EditarUsuarioDto {
  @IsOptional() @IsString() @MinLength(2) nombre?: string;
  @IsOptional() @IsEmail() correo?: string;
  @IsOptional() @IsString() @MinLength(1) unidad?: string;
  @IsOptional() @IsIn(ROLES as unknown as string[]) rol?: string;
  @IsOptional() @IsIn(["Activo", "Inactivo"]) estado?: string;
  /** Si se envía, restablece la contraseña */
  @IsOptional() @IsString() @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" }) password?: string;
}

@Controller("usuarios")
@Roles("Administrador")
export class UsuariosController {
  private repo = this.ds.getRepository(Usuario);
  constructor(private ds: DataSource) {}

  @Get()
  listar() {
    return this.repo.find({ order: { id: "ASC" } }); // passwordHash tiene select:false
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    const correo = dto.correo.trim().toLowerCase();
    if (await this.repo.existsBy({ correo })) throw new ConflictException("Ya existe un usuario con ese correo");
    const u = await this.repo.save(
      this.repo.create({
        nombre: dto.nombre.trim(),
        correo,
        unidad: dto.unidad,
        rol: dto.rol,
        estado: dto.estado,
        passwordHash: await bcrypt.hash(dto.password, 10),
      }),
    );
    return this.repo.findOneByOrFail({ id: u.id });
  }

  @Patch(":id")
  async editar(@Param("id", ParseIntPipe) id: number, @Body() dto: EditarUsuarioDto, @CurrentUser() yo: SesionUsuario) {
    const actual = await this.repo.findOneBy({ id });
    if (!actual) throw new NotFoundException("Usuario no encontrado");

    // Evita que el administrador se deje sin acceso a sí mismo
    if (id === yo.id && ((dto.estado && dto.estado !== "Activo") || (dto.rol && dto.rol !== "Administrador"))) {
      throw new BadRequestException("No puedes desactivarte ni quitarte el rol de Administrador a ti mismo");
    }

    const correo = dto.correo?.trim().toLowerCase();
    if (correo && correo !== actual.correo && (await this.repo.existsBy({ correo }))) {
      throw new ConflictException("Ya existe un usuario con ese correo");
    }

    const { password, ...resto } = dto;
    await this.repo.update(id, {
      ...resto,
      ...(correo ? { correo } : {}),
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    });
    return this.repo.findOneByOrFail({ id });
  }
}

@Module({ controllers: [UsuariosController] })
export class UsuariosModule {}

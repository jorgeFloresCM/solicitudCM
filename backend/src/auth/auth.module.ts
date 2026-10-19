import { Body, Controller, Get, HttpCode, Module, Post, Res, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Throttle } from "@nestjs/throttler";
import { IsEmail, IsString, MinLength } from "class-validator";
import * as bcrypt from "bcryptjs";
import type { Response } from "express";
import { DataSource } from "typeorm";
import { Usuario } from "../entities";
import { COOKIE_NAME, CurrentUser, Public } from "../common/auth.guard";
import { SesionUsuario } from "../common/roles";

class LoginDto {
  @IsEmail() correo: string;
  @IsString() @MinLength(1) password: string;
}

const OCHO_HORAS = 8 * 60 * 60 * 1000;

@Controller("auth")
export class AuthController {
  constructor(private ds: DataSource, private jwt: JwtService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // anti fuerza bruta
  @HttpCode(200)
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const u = await this.ds
      .getRepository(Usuario)
      .createQueryBuilder("u")
      .addSelect("u.passwordHash")
      .where("u.correo = :correo", { correo: dto.correo.trim().toLowerCase() })
      .getOne();
    // Mismo mensaje en todos los casos para no revelar qué correos existen
    const ok = u && u.estado === "Activo" && (await bcrypt.compare(dto.password, u.passwordHash));
    if (!u || !ok) throw new UnauthorizedException("Correo o contraseña incorrectos");

    const token = await this.jwt.signAsync({ sub: u.id });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: OCHO_HORAS,
      path: "/",
    });
    return { id: u.id, nombre: u.nombre, correo: u.correo, unidad: u.unidad, rol: u.rol };
  }

  @Get("me")
  me(@CurrentUser() user: SesionUsuario) {
    return user;
  }

  @Public()
  @HttpCode(200)
  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    return { ok: true };
  }
}

@Module({ controllers: [AuthController] })
export class AuthModule {}

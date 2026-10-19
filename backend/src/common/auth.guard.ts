import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { Usuario } from "../entities";
import { Rol, SesionUsuario } from "./roles";

export const COOKIE_NAME = "sgi_token";

export const Public = () => SetMetadata("isPublic", true);
export const Roles = (...roles: Rol[]) => SetMetadata("roles", roles);

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SesionUsuario => ctx.switchToHttp().getRequest().user,
);

/**
 * Guard global: exige sesión válida (cookie JWT) salvo en rutas @Public()
 * y, si la ruta declara @Roles(...), que el rol del usuario esté permitido.
 * El usuario se relee de la BD en cada petición, así un usuario desactivado
 * o con rol cambiado pierde acceso de inmediato.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwt: JwtService,
    private ds: DataSource,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const targets = [ctx.getHandler(), ctx.getClass()];
    if (this.reflector.getAllAndOverride<boolean>("isPublic", targets)) return true;

    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new UnauthorizedException("No autenticado");

    let sub: number;
    try {
      sub = (await this.jwt.verifyAsync<{ sub: number }>(token)).sub;
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada");
    }

    const u = await this.ds.getRepository(Usuario).findOneBy({ id: sub });
    if (!u || u.estado !== "Activo") throw new UnauthorizedException("Usuario inactivo o inexistente");

    req.user = { id: u.id, nombre: u.nombre, correo: u.correo, unidad: u.unidad, rol: u.rol } as SesionUsuario;

    const roles = this.reflector.getAllAndOverride<Rol[]>("roles", targets);
    if (roles && !roles.includes(u.rol as Rol)) {
      throw new ForbiddenException("No tienes permiso para esta acción");
    }
    return true;
  }
}

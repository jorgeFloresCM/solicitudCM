import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./database/data-source";
import { AuthGuard } from "./common/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { CatalogosModule } from "./catalogos/catalogos.module";
import { BoletasModule } from "./boletas/boletas.module";
import { RespaldosModule } from "./respaldos/respaldos.module";
import { EstadisticasModule } from "./estadisticas/estadisticas.module";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  throw new Error("Falta JWT_SECRET (mínimo 16 caracteres) en el archivo .env");
}

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions()),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: "8h" } }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    AuthModule,
    UsuariosModule,
    CatalogosModule,
    BoletasModule,
    RespaldosModule,
    EstadisticasModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}

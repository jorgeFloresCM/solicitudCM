import { Controller, Get, Module } from "@nestjs/common";
import { DataSource, IsNull, Not } from "typeorm";
import { Boleta } from "../entities";
import { ESTADOS_BOLETA } from "../common/roles";

@Controller("estadisticas")
export class EstadisticasController {
  constructor(private ds: DataSource) {}

  @Get()
  async resumen() {
    const repo = this.ds.getRepository(Boleta);
    const [grupos, resueltas] = await Promise.all([
      repo
        .createQueryBuilder("b")
        .select("b.estado", "estado")
        .addSelect("COUNT(*)::int", "n")
        .groupBy("b.estado")
        .getRawMany<{ estado: string; n: number }>(),
      repo.find({ where: { estado: "Resuelta", resueltaAt: Not(IsNull()) }, select: { createdAt: true, resueltaAt: true } }),
    ]);

    const porEstado: Record<string, number> = Object.fromEntries(ESTADOS_BOLETA.map((e) => [e, 0]));
    for (const g of grupos) porEstado[g.estado] = g.n;

    // Tiempo promedio de atención (días) = media de (resuelta - creada)
    const DIA = 24 * 60 * 60 * 1000;
    const tiempoPromedioDias = resueltas.length
      ? resueltas.reduce((s, b) => s + (b.resueltaAt!.getTime() - b.createdAt.getTime()), 0) / resueltas.length / DIA
      : null;

    return {
      total: Object.values(porEstado).reduce((a, b) => a + b, 0),
      porEstado,
      tiempoPromedioDias,
    };
  }
}

@Module({ controllers: [EstadisticasController] })
export class EstadisticasModule {}

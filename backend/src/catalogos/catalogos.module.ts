import { Controller, Get, Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TipoError, Unidad, Usuario } from "../entities";
import { ESTADOS_BOLETA, PRIORIDADES, ROLES } from "../common/roles";

/** Catálogos dinámicos para los formularios (HU-04). Cualquier usuario autenticado puede leerlos. */
@Controller("catalogos")
export class CatalogosController {
  constructor(private ds: DataSource) {}

  @Get()
  async todos() {
    const [unidades, tiposError, tecnicos] = await Promise.all([
      this.ds.getRepository(Unidad).find({ where: { activo: true }, order: { id: "ASC" } }),
      this.ds.getRepository(TipoError).find({ where: { activo: true }, order: { id: "ASC" } }),
      this.ds.getRepository(Usuario).find({
        where: { rol: "Técnico", estado: "Activo" },
        select: { id: true, nombre: true },
        order: { nombre: "ASC" },
      }),
    ]);
    return {
      unidades: unidades.map((u) => u.nombre),
      tiposError: tiposError.map((t) => t.nombre),
      tecnicos,
      roles: ROLES,
      estados: ESTADOS_BOLETA,
      prioridades: PRIORIDADES,
    };
  }
}

@Module({ controllers: [CatalogosController] })
export class CatalogosModule {}

import { DataSourceOptions } from "typeorm";
import { ENTITIES } from "../entities";

/** Opciones de conexión compartidas por la app y por el seed. Lee process.env, por eso se carga después de dotenv. */
export function dataSourceOptions(): DataSourceOptions {
  return {
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: ENTITIES,
    synchronize: process.env.DB_SYNCHRONIZE === "true",
  };
}

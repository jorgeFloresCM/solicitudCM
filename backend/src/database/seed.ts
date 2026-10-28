import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "./data-source";
import { Boleta, HistorialBoleta, Secuencia, TipoError, Unidad, Usuario } from "../entities";

const UNIDADES = [
  "Ventanilla de Ingreso",
  "Secretaría General",
  "Gabinete técnico",
  "Caja",
  "Oficina de Registrador",
  "Ventanilla de entrega",
  "Unidad de Informática",
];

const TIPOS_ERROR = [
  "Devolución de documento",
  "Cambio de Estado",
  "Baja de documento",
  "Indexación",
  "Impresión / periféricos",
  "Accesos y contraseñas",
  "Habilitación de Valorados",
];

const USUARIOS = [
  { nombre: "María Quispe", correo: "mquispe@cmag.gov.bo", unidad: "Secretaría General", rol: "Administrador" },
  { nombre: "Juan Pérez", correo: "jperez@cmag.gov.bo", unidad: "Caja", rol: "Consulta" },
  { nombre: "Ana Rojas", correo: "arojas@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico" },
  { nombre: "Carlos Vargas", correo: "cvargas@cmag.gov.bo", unidad: "Secretaría General", rol: "Directivo" },
  { nombre: "Luis Paredes", correo: "lparedes@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Consulta" },
  { nombre: "Elena Molina", correo: "emolina@cmag.gov.bo", unidad: "Oficina de Registrador", rol: "Consulta", estado: "Inactivo" },
  { nombre: "Ing. Jhonathan Calderon", correo: "jcalderon@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico" },
  { nombre: "Ing. Alex Pedrana", correo: "apedrana@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico" },
  { nombre: "Ing. Rodrigo Soto", correo: "rsoto@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico" },
  { nombre: "Ing. Mauricio Cartagena", correo: "mcartagena@cmag.gov.bo", unidad: "Unidad de Informática", rol: "Técnico" },
];

// Boletas de ejemplo (equivalen a BOLETAS_INICIAL del prototipo)
const BOLETAS = [
  { n: 1, solicitante: "Juan Pérez", unidad: "Ventanilla de Ingreso", tipoError: "Accesos y contraseñas", descripcion: "No puedo ingresar al sistema de ventanilla desde mi estación de trabajo.", fecha: "2026-10-01", estado: "Resuelta", prioridad: "Alta", tecnico: "arojas@cmag.gov.bo", dias: 2 },
  { n: 2, solicitante: "Elena Molina", unidad: "Ventanilla de entrega", tipoError: "Impresión / periféricos", descripcion: "La impresora multifuncional atasca papel constantemente.", fecha: "2026-10-03", estado: "Asignada", prioridad: "Media", tecnico: "apedrana@cmag.gov.bo" },
  { n: 3, solicitante: "María Quispe", unidad: "Secretaría General", tipoError: "Accesos y contraseñas", descripcion: "Solicito restablecimiento de contraseña de correo institucional.", fecha: "2026-10-05", estado: "Pendiente", prioridad: "Alta" },
  { n: 4, solicitante: "Carlos Vargas", unidad: "Gabinete técnico", tipoError: "Indexación", descripcion: "Los documentos escaneados no se indexan correctamente.", fecha: "2026-10-07", estado: "En atención", prioridad: "Media", tecnico: "rsoto@cmag.gov.bo" },
  { n: 5, solicitante: "Juan Pérez", unidad: "Caja", tipoError: "Habilitación de Valorados", descripcion: "Se requiere habilitar un nuevo bloque de valorados en caja.", fecha: "2026-10-09", estado: "Pendiente", prioridad: "Baja" },
  { n: 6, solicitante: "Elena Molina", unidad: "Oficina de Registrador", tipoError: "Cambio de Estado", descripcion: "No permite cambiar el estado del documento a «Entregado».", fecha: "2026-10-10", estado: "Pendiente", prioridad: "Alta" },
];

async function main() {
  const ds = new DataSource({ ...dataSourceOptions(), synchronize: true }); // el seed garantiza que las tablas existan
  await ds.initialize();

  const password = process.env.SEED_PASSWORD || "Cambiar123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await ds.getRepository(Unidad).upsert(UNIDADES.map((nombre) => ({ nombre })), ["nombre"]);
  await ds.getRepository(TipoError).upsert(TIPOS_ERROR.map((nombre) => ({ nombre })), ["nombre"]);

  const usuarios = ds.getRepository(Usuario);
  for (const u of USUARIOS) {
    if (!(await usuarios.existsBy({ correo: u.correo }))) {
      await usuarios.save(usuarios.create({ ...u, estado: u.estado ?? "Activo", passwordHash }));
    }
  }

  const boletas = ds.getRepository(Boleta);
  if ((await boletas.count()) === 0) {
    for (const b of BOLETAS) {
      const tec = b.tecnico ? await usuarios.findOneBy({ correo: b.tecnico }) : null;
      const creada = new Date(`${b.fecha}T12:00:00Z`);
      await boletas.insert({
        id: `BOL-2026-${String(b.n).padStart(3, "0")}`,
        solicitante: b.solicitante,
        unidad: b.unidad,
        tipoError: b.tipoError,
        descripcion: b.descripcion,
        fecha: b.fecha,
        estado: b.estado,
        prioridad: b.prioridad,
        tecnicoId: tec?.id ?? null,
        createdAt: creada,
        resueltaAt: b.dias ? new Date(creada.getTime() + b.dias * 86_400_000) : null,
      });
      // Los datos de ejemplo parten con un único evento de registro (el historial real empieza al usarlo)
      await ds.getRepository(HistorialBoleta).insert({
        boletaId: `BOL-2026-${String(b.n).padStart(3, "0")}`,
        accion: "Registro",
        estadoNuevo: "Pendiente",
        detalle: "Dato de ejemplo (seed)",
        usuarioNombre: "Sistema",
        usuarioRol: "Sistema",
        createdAt: creada,
      });
    }
    await ds.getRepository(Secuencia).save({ anio: 2026, ultimo: BOLETAS.length });
  }

  console.log(`Seed completo. Contraseña inicial de los usuarios: ${password}`);
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// prisma/seed.ts
import { PrismaClient, TipoEstatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Enums locales para evitar problemas de importación en seed
const AccionBitacora = {
  CREAR: "CREAR",
  MODIFICAR: "MODIFICAR",
  ELIMINAR: "ELIMINAR",
  ASIGNAR: "ASIGNAR",
  DEVOLVER: "DEVOLVER",
  LOGIN: "LOGIN",
} as const;

const SeccionBitacora = {
  EQUIPOS: "EQUIPOS",
  ASIGNACIONES: "ASIGNACIONES",
  USUARIOS: "USUARIOS",
  MARCAS: "MARCAS",
  MODELOS: "MODELOS",
  UBICACIONES: "UBICACIONES",
  CENTROS: "CENTROS",
  PUESTOS: "PUESTOS",
  TIPOS: "TIPOS",
} as const;

async function main() {
  console.log("Iniciando seed de GMAS 2.0...");

  // =====================================================
  // 1. ROLES
  // =====================================================
  const employee = await prisma.rol.upsert({
    where: { nombre: "employee" },
    update: {},
    create: { nombre: "employee" },
  });

  const admin = await prisma.rol.upsert({
    where: { nombre: "admin" },
    update: {},
    create: { nombre: "admin" },
  });

  const master = await prisma.rol.upsert({
    where: { nombre: "master" },
    update: {},
    create: { nombre: "master" },
  });

  console.log("Roles listos:", { employee, admin, master });

  // =====================================================
  // 2. ESTATUS
  // =====================================================
  // EQUIPO
  const estEquipoDisponible = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Disponible",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.EQUIPO,
      nombre: "Disponible",
    },
  });

  const estEquipoAsignado = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Asignado",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.EQUIPO,
      nombre: "Asignado",
    },
  });

  const estEquipoReparacion = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "En reparación",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.EQUIPO,
      nombre: "En reparación",
    },
  });

  // PERSONAL
  const estPersonalActivo = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.PERSONAL,
        nombre: "Activo",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.PERSONAL,
      nombre: "Activo",
    },
  });

  const estPersonalBaja = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.PERSONAL,
        nombre: "Baja",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.PERSONAL,
      nombre: "Baja",
    },
  });

  // UBICACION
  const estUbicacionActiva = await prisma.estatus.upsert({
    where: {
      tipo_nombre: {
        tipo: TipoEstatus.UBICACION,
        nombre: "Activa",
      },
    },
    update: {},
    create: {
      tipo: TipoEstatus.UBICACION,
      nombre: "Activa",
    },
  });

  console.log("Estatus listos");

  // =====================================================
  // 3. UBICACIONES
  // =====================================================
  const ubicacionCentral = await prisma.ubicacion.upsert({
    where: { nombre: "Oficinas Centrales" },
    update: {},
    create: {
      nombre: "Oficinas Centrales",
      estatusId: estUbicacionActiva.id,
      notas: "Ubicación principal",
    },
  });

  console.log("Ubicación base lista:", ubicacionCentral);

  // =====================================================
  // 4. PUESTOS
  // =====================================================
  const puestoSoporte = await prisma.puesto.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: "Analista de Soporte",
      notas: "Soporte a usuarios finales",
    },
  });

  const puestoJefeArea = await prisma.puesto.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nombre: "Jefe de Área",
      notas: "Responsable de equipo de TI",
    },
  });

  const puestoDirectorTI = await prisma.puesto.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nombre: "Director de TI",
      notas: "Responsable de la estrategia tecnológica",
    },
  });

  console.log("Puestos listos");

  // =====================================================
  // 5. CENTROS
  // =====================================================
  const centroVeracruz = await prisma.centro.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: "Centro Veracruz",
      ubicacionId: ubicacionCentral.id,
      notas: "Centro principal en Veracruz",
    },
  });

  console.log("Centros listos");

  // =====================================================
  // 6. LÍDERES
  // =====================================================
  const liderPrincipal = await prisma.lider.upsert({
    where: { email: "lider.principal@gmas.local" },
    update: {},
    create: {
      nombre: "Carlos",
      apellidoPaterno: "López",
      apellidoMaterno: "García",
      email: "lider.principal@gmas.local",
      telefono: "2290000000",
      centroId: centroVeracruz.id,
      puestoId: puestoJefeArea.id,
      estatusId: estPersonalActivo.id,
    },
  });

  console.log("Líder principal listo:", liderPrincipal);

  // =====================================================
  // 7. USUARIOS (con passwords hasheados)
  // =====================================================
  const passwordPlano = "123456";
  const hashPassword = await bcrypt.hash(passwordPlano, 10);

  const usuarioEmployee = await prisma.usuario.upsert({
    where: { email: "employee@gmas.local" },
    update: { hashPassword },
    create: {
      nombre: "Empleado",
      apellidoPaterno: "Prueba",
      email: "employee@gmas.local",
      hashPassword,
      rolId: employee.id,
      liderId: liderPrincipal.id,
      puestoId: puestoSoporte.id,
      centroId: centroVeracruz.id,
      activo: true,
    },
  });

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: "admin@gmas.local" },
    update: { hashPassword },
    create: {
      nombre: "Administrador",
      apellidoPaterno: "Sistema",
      email: "admin@gmas.local",
      hashPassword,
      rolId: admin.id,
      liderId: liderPrincipal.id,
      puestoId: puestoJefeArea.id,
      centroId: centroVeracruz.id,
      activo: true,
    },
  });

  const usuarioMaster = await prisma.usuario.upsert({
    where: { email: "master@gmas.local" },
    update: { hashPassword },
    create: {
      nombre: "Master",
      apellidoPaterno: "User",
      email: "master@gmas.local",
      hashPassword,
      rolId: master.id,
      liderId: liderPrincipal.id,
      puestoId: puestoDirectorTI.id,
      centroId: centroVeracruz.id,
      activo: true,
    },
  });

  console.log("Usuarios listos (password: 123456)");

  // =====================================================
  // 8. CATÁLOGOS DE EQUIPO
  // =====================================================
  // TIPOS
  const tipo = await prisma.tipoEquipo.upsert({
    where: { nombre: "Laptop" },
    update: {},
    create: { nombre: "Laptop" },
  });
  const tipoImpresora = await prisma.tipoEquipo.upsert({
    where: { nombre: "Impresora" },
    update: {},
    create: { nombre: "Impresora" },
  });
  const tipoSim = await prisma.tipoEquipo.upsert({
    where: { nombre: "SIM" },
    update: {},
    create: { nombre: "SIM" },
  });
  const tipoConsumible = await prisma.tipoEquipo.upsert({
    where: { nombre: "Consumible" },
    update: {},
    create: { nombre: "Consumible" },
  });

  // MARCAS
  const marca = await prisma.marca.upsert({
    where: { nombre: "Dell" },
    update: {},
    create: { nombre: "Dell" },
  });
  const marcaHP = await prisma.marca.upsert({
    where: { nombre: "HP" },
    update: {},
    create: { nombre: "HP" },
  });
  const marcaTelcel = await prisma.marca.upsert({
    where: { nombre: "Telcel" },
    update: {},
    create: { nombre: "Telcel" },
  });
  const marcaGenerica = await prisma.marca.upsert({
    where: { nombre: "Genérica" },
    update: {},
    create: { nombre: "Genérica" },
  });

  // RELACIÓN MARCA - TIPO
  await prisma.marcaTipo.upsert({
    where: {
      marcaId_tipoId: {
        marcaId: marca.id,
        tipoId: tipo.id,
      },
    },
    update: {},
    create: {
      marcaId: marca.id,
      tipoId: tipo.id,
    },
  });

  await prisma.marcaTipo.upsert({
    where: {
      marcaId_tipoId: {
        marcaId: marcaHP.id,
        tipoId: tipoImpresora.id,
      },
    },
    update: {},
    create: {
      marcaId: marcaHP.id,
      tipoId: tipoImpresora.id,
    },
  });

  // Telcel -> SIM
  await prisma.marcaTipo.upsert({
    where: {
      marcaId_tipoId: {
        marcaId: marcaTelcel.id,
        tipoId: tipoSim.id,
      },
    },
    update: {},
    create: {
      marcaId: marcaTelcel.id,
      tipoId: tipoSim.id,
    },
  });

  // Genérica -> Consumible
  await prisma.marcaTipo.upsert({
    where: {
      marcaId_tipoId: {
        marcaId: marcaGenerica.id,
        tipoId: tipoConsumible.id,
      },
    },
    update: {},
    create: {
      marcaId: marcaGenerica.id,
      tipoId: tipoConsumible.id,
    },
  });

  // MODELOS
  const modelo = await prisma.modelo.findFirst({
    where: { nombre: "Latitude 5420", marcaId: marca.id },
  });

  let modeloId = modelo?.id;
  if (!modeloId) {
    const creado = await prisma.modelo.create({
      data: {
        nombre: "Latitude 5420",
        marcaId: marca.id,
        tipoId: tipo.id,
      },
    });
    modeloId = creado.id;
  }

  const modeloImpresora = await prisma.modelo.findFirst({
    where: { nombre: "LaserJet Pro", marcaId: marcaHP.id },
  });
  let modeloImpresoraId = modeloImpresora?.id;
  if (!modeloImpresoraId) {
    const creado = await prisma.modelo.create({
      data: {
        nombre: "LaserJet Pro",
        marcaId: marcaHP.id,
        tipoId: tipoImpresora.id,
      },
    });
    modeloImpresoraId = creado.id;
  }

  // =====================================================
  // 9. EQUIPOS
  // =====================================================
  const color = await prisma.color.upsert({
    where: { nombre: "Negro" },
    update: {},
    create: { nombre: "Negro" },
  });

  // 9.1 Equipo Laptop (Disponible)
  const equipoLaptopDisponible = await prisma.equipo.upsert({
    where: { numeroSerie: "DELL-001" },
    update: {},
    create: {
      numeroSerie: "DELL-001",
      tipoId: tipo.id,
      modeloId: modeloId!,
      estatusId: estEquipoDisponible.id,
      ubicacionId: ubicacionCentral.id,
    },
  });

  // 9.2 Equipo Laptop (Asignado)
  const equipoLaptopAsignado = await prisma.equipo.upsert({
    where: { numeroSerie: "DELL-002" },
    update: {},
    create: {
      numeroSerie: "DELL-002",
      tipoId: tipo.id,
      modeloId: modeloId!,
      estatusId: estEquipoAsignado.id, // Asignado
      ubicacionId: ubicacionCentral.id,
    },
  });

  // 9.3 Impresora
  const equipoImpresora = await prisma.equipo.upsert({
    where: { numeroSerie: "HP-PRT-001" },
    update: {},
    create: {
      numeroSerie: "HP-PRT-001",
      tipoId: tipoImpresora.id,
      modeloId: modeloImpresoraId!,
      estatusId: estEquipoDisponible.id,
      ubicacionId: ubicacionCentral.id,
    },
  });

  // 9.4 SIM (EquipoSim)
  // Modelo genérico para SIM
  const modeloSim = await prisma.modelo.findFirst({ where: { nombre: "Chip 4G", marcaId: marcaTelcel.id } });
  let modeloSimId = modeloSim?.id;
  if (!modeloSimId) {
    const m = await prisma.modelo.create({ data: { nombre: "Chip 4G", marcaId: marcaTelcel.id, tipoId: tipoSim.id } });
    modeloSimId = m.id;
  }

  const equipoSim = await prisma.equipo.upsert({
    where: { numeroSerie: "SIM-5551234567" },
    update: {},
    create: {
      numeroSerie: "SIM-5551234567",
      tipoId: tipoSim.id,
      modeloId: modeloSimId!,
      estatusId: estEquipoDisponible.id,
      ubicacionId: ubicacionCentral.id,
    },
  });

  // 9.5 Consumible
  const modeloConsumible = await prisma.modelo.findFirst({ where: { nombre: "Toner Negro", marcaId: marcaGenerica.id } });
  let modeloConsumibleId = modeloConsumible?.id;
  if (!modeloConsumibleId) {
    const m = await prisma.modelo.create({ data: { nombre: "Toner Negro", marcaId: marcaGenerica.id, tipoId: tipoConsumible.id } });
    modeloConsumibleId = m.id;
  }

  const equipoConsumible = await prisma.equipo.upsert({
    where: { numeroSerie: "TONER-BLK-001" },
    update: {},
    create: {
      numeroSerie: "TONER-BLK-001",
      tipoId: tipoConsumible.id,
      modeloId: modeloConsumibleId!,
      estatusId: estEquipoDisponible.id,
      ubicacionId: ubicacionCentral.id,
    },
  });

  // Detalles específicos (tablas 1:1)
  // EquipoSim
  await prisma.equipoSim.upsert({
    where: { equipoId: equipoSim.id },
    update: {},
    create: {
      equipoId: equipoSim.id,
      numeroAsignado: "5551234567",
      imei: "123456789012345",
    },
  });

  // EquipoConsumible
  await prisma.equipoConsumible.upsert({
    where: { equipoId: equipoConsumible.id },
    update: {},
    create: {
      equipoId: equipoConsumible.id,
      colorId: color.id,
    },
  });

  console.log("Equipos listos");

  // =====================================================
  // 10. ASIGNACIONES
  // =====================================================
  // Asignar la laptop DELL-002 al usuario Employee
  // Verificar si ya existe asignación activa
  const asignacionExistente = await prisma.asignacion.findFirst({
    where: {
      equipoId: equipoLaptopAsignado.id,
      devueltoEn: null
    }
  });

  let asignacionLaptop;
  if (!asignacionExistente) {
    asignacionLaptop = await prisma.asignacion.create({
      data: {
        equipoId: equipoLaptopAsignado.id,
        usuarioId: usuarioEmployee.id,
        asignadoEn: new Date(),
        asignadoPor: usuarioAdmin.id, // Admin asignó
      },
    });
    console.log("Asignación lista:", asignacionLaptop);
  } else {
    asignacionLaptop = asignacionExistente;
    console.log("Asignación ya existente:", asignacionLaptop);
  }


  // =====================================================
  // 11. BITÁCORA (Ejemplos)
  // =====================================================
  await prisma.bitacora.createMany({
    data: [
      {
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: equipoLaptopDisponible.id,
        autorId: usuarioAdmin.id,
        detalles: { serie: "DELL-001", modelo: "Latitude 5420" },
      },
      {
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: equipoLaptopAsignado.id,
        autorId: usuarioAdmin.id,
        detalles: { serie: "DELL-002", modelo: "Latitude 5420" },
      },
      {
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: equipoImpresora.id,
        autorId: usuarioAdmin.id,
        detalles: { serie: "HP-PRT-001", modelo: "LaserJet Pro" },
      },
      {
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: equipoSim.id,
        autorId: usuarioAdmin.id,
        detalles: { serie: "SIM-5551234567", numero: "5551234567" },
      },
      {
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: equipoConsumible.id,
        autorId: usuarioAdmin.id,
        detalles: { serie: "TONER-BLK-001", tipo: "Toner" },
      },
    ],
  });

  // Bitácora de la asignación
  if (!asignacionExistente) {
    await prisma.bitacora.create({
      data: {
        accion: AccionBitacora.ASIGNAR,
        seccion: SeccionBitacora.ASIGNACIONES,
        elementoId: asignacionLaptop.id,
        autorId: usuarioAdmin.id,
        detalles: {
          usuarioId: usuarioEmployee.id,
          estatusOrigenId: estEquipoDisponible.id,
          estatusDestinoId: estEquipoAsignado.id,
          notas: "Asignación inicial de laptop al empleado de prueba",
        },
      },
    });
  }

  console.log("Bitácora de movimientos lista");

  console.log("✅ Seed de GMAS 2.0 completado.");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

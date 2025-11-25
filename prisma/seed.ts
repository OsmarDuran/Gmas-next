// prisma/seed.ts
import {
  PrismaClient,
  TipoEstatus,
  AccionBitacora,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
    update: {},
    create: {
      nombre: "Empleado",
      apellidoPaterno: "Demo",
      email: "employee@gmas.local",
      telefono: "2291111111",
      liderId: liderPrincipal.id,
      puestoId: puestoSoporte.id,
      centroId: centroVeracruz.id,
      rolId: employee.id,
      hashPassword,
    },
  });

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: "admin@gmas.local" },
    update: {},
    create: {
      nombre: "Administrador",
      apellidoPaterno: "Demo",
      email: "admin@gmas.local",
      telefono: "2292222222",
      liderId: liderPrincipal.id,
      puestoId: puestoJefeArea.id,
      centroId: centroVeracruz.id,
      rolId: admin.id,
      hashPassword,
    },
  });

  const usuarioMaster = await prisma.usuario.upsert({
    where: { email: "master@gmas.local" },
    update: {},
    create: {
      nombre: "Master",
      apellidoPaterno: "Demo",
      email: "master@gmas.local",
      telefono: "2293333333",
      liderId: liderPrincipal.id,
      puestoId: puestoDirectorTI.id,
      centroId: centroVeracruz.id,
      rolId: master.id,
      hashPassword,
    },
  });

  console.log("Usuarios listos:", {
    usuarioEmployee,
    usuarioAdmin,
    usuarioMaster,
  });

  // =====================================================
  // 8. TIPOS DE EQUIPO
  // =====================================================
  const tiposNombres = [
    "Laptop",
    "Impresora",
    "Access Point",
    "Workstation",
    "Monitor",
    "Teléfono fijo",
    "Celular",
    "Tablet",
    "Computadora móvil",
    "Antena",
    "Consumible",
    "SIM",
  ];

  const tiposMap: Record<string, number> = {};

  for (const nombre of tiposNombres) {
    const tipo = await prisma.tipoEquipo.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    tiposMap[nombre] = tipo.id;
  }

  console.log("Tipos de equipo listos:", tiposMap);

  const laptopId = tiposMap["Laptop"];
  const impresoraId = tiposMap["Impresora"];
  const apId = tiposMap["Access Point"];
  const celularId = tiposMap["Celular"];
  const simId = tiposMap["SIM"];
  const consumibleId = tiposMap["Consumible"];

  // =====================================================
  // 9. MARCAS
  // =====================================================
  const marcasNombres = [
    "HP",
    "Dell",
    "Lenovo",
    "Canon",
    "Epson",
    "Cisco",
    "Apple",
    "Samsung",
    "Telcel",
  ];

  const marcasMap: Record<string, number> = {};

  for (const nombre of marcasNombres) {
    const marca = await prisma.marca.upsert({
      where: { nombre },
      update: {},
      create: { nombre, activo: true },
    });
    marcasMap[nombre] = marca.id;
  }

  console.log("Marcas listas:", marcasMap);

  // =====================================================
  // 10. RELACIÓN MARCA–TIPO (MarcaTipo)
  // =====================================================

  const relacionesMarcaTipo: Array<{ marca: string; tipoId: number }> = [
    // Laptops
    { marca: "HP", tipoId: laptopId },
    { marca: "Dell", tipoId: laptopId },
    { marca: "Lenovo", tipoId: laptopId },
    { marca: "Apple", tipoId: laptopId },

    // Impresoras
    { marca: "HP", tipoId: impresoraId },
    { marca: "Canon", tipoId: impresoraId },
    { marca: "Epson", tipoId: impresoraId },

    // Access Point
    { marca: "Cisco", tipoId: apId },

    // Celulares
    { marca: "Samsung", tipoId: celularId },
    { marca: "Apple", tipoId: celularId },

    // Consumibles
    { marca: "HP", tipoId: consumibleId },
    { marca: "Canon", tipoId: consumibleId },
    { marca: "Epson", tipoId: consumibleId },

    // SIM
    { marca: "Telcel", tipoId: simId },
  ].filter((r) => r.tipoId); // por si algún tipo no existe

  for (const rel of relacionesMarcaTipo) {
    const marcaId = marcasMap[rel.marca];
    if (!marcaId || !rel.tipoId) continue;

    await prisma.marcaTipo.upsert({
      where: {
        marcaId_tipoId: {
          marcaId,
          tipoId: rel.tipoId,
        },
      },
      update: {},
      create: {
        marcaId,
        tipoId: rel.tipoId,
      },
    });
  }

  console.log("Relaciones MarcaTipo listas");

  // =====================================================
  // 11. MODELOS
  // =====================================================

  const modelosMap: Record<string, number> = {};

  async function ensureModelo(
    marcaNombre: string,
    tipoNombre: string,
    modeloNombre: string
  ) {
    const marcaId = marcasMap[marcaNombre];
    const tipoId = tiposMap[tipoNombre];
    if (!marcaId || !tipoId) return;

    const existente = await prisma.modelo.findFirst({
      where: {
        marcaId,
        tipoId,
        nombre: modeloNombre,
      },
    });

    if (!existente) {
      const creado = await prisma.modelo.create({
        data: {
          marcaId,
          tipoId,
          nombre: modeloNombre,
          activo: true,
        },
      });
      modelosMap[modeloNombre] = creado.id;
    } else {
      modelosMap[modeloNombre] = existente.id;
    }
  }

  // Laptops
  await ensureModelo("HP", "Laptop", "HP ProBook 440 G9");
  await ensureModelo("HP", "Laptop", "HP EliteBook 840");
  await ensureModelo("Dell", "Laptop", "Latitude 5420");
  await ensureModelo("Lenovo", "Laptop", "ThinkPad T14");
  await ensureModelo("Apple", "Laptop", "MacBook Pro 14");

  // Impresoras
  await ensureModelo("HP", "Impresora", "LaserJet Pro M404");
  await ensureModelo("Canon", "Impresora", "imageCLASS LBP226dw");
  await ensureModelo("Epson", "Impresora", "EcoTank L3250");

  // Access Points
  await ensureModelo("Cisco", "Access Point", "Aironet 1830");

  // Celulares
  await ensureModelo("Samsung", "Celular", "Galaxy A54");
  await ensureModelo("Apple", "Celular", "iPhone 13");

  // SIM (Telcel)
  await ensureModelo("Telcel", "SIM", "SIM Datos 4G");

  console.log("Modelos listos");

  // =====================================================
  // 12. COLORES (para consumibles)
  // =====================================================
  const coloresNombres = ["Negro", "Cian", "Magenta", "Amarillo"];

  const coloresMap: Record<string, number> = {};

  for (const nombre of coloresNombres) {
    const color = await prisma.color.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    coloresMap[nombre] = color.id;
  }

  console.log("Colores listos:", coloresMap);

  // =====================================================
  // 13. EQUIPOS
  // =====================================================
  // Laptop disponible
  const equipoLaptopDisponible = await prisma.equipo.upsert({
    where: { numeroSerie: "LAP-001" },
    update: {},
    create: {
      tipoId: tiposMap["Laptop"],
      modeloId: modelosMap["HP ProBook 440 G9"],
      ubicacionId: ubicacionCentral.id,
      estatusId: estEquipoDisponible.id,
      numeroSerie: "LAP-001",
      ipFija: "192.168.0.10",
      puertoEthernet: "0/1/1",
      notas: "Laptop de prueba disponible",
    },
  });

  // Laptop asignada
  const equipoLaptopAsignado = await prisma.equipo.upsert({
    where: { numeroSerie: "LAP-002" },
    update: {},
    create: {
      tipoId: tiposMap["Laptop"],
      modeloId: modelosMap["Dell Latitude 5420"]
        ?? modelosMap["Latitude 5420"],
      ubicacionId: ubicacionCentral.id,
      estatusId: estEquipoAsignado.id,
      numeroSerie: "LAP-002",
      ipFija: "192.168.0.11",
      puertoEthernet: "0/1/2",
      notas: "Laptop de prueba asignada",
    },
  });

  // Impresora disponible
  const equipoImpresora = await prisma.equipo.upsert({
    where: { numeroSerie: "IMP-001" },
    update: {},
    create: {
      tipoId: tiposMap["Impresora"],
      modeloId: modelosMap["LaserJet Pro M404"],
      ubicacionId: ubicacionCentral.id,
      estatusId: estEquipoDisponible.id,
      numeroSerie: "IMP-001",
      notas: "Impresora láser monocromática",
    },
  });

  // SIM disponible
  const equipoSim = await prisma.equipo.upsert({
    where: { numeroSerie: "SIM-001" },
    update: {},
    create: {
      tipoId: tiposMap["SIM"],
      modeloId: modelosMap["SIM Datos 4G"],
      ubicacionId: ubicacionCentral.id,
      estatusId: estEquipoDisponible.id,
      numeroSerie: "SIM-001",
      notas: "SIM de datos 4G Telcel",
    },
  });

  // Consumible disponible (un tóner, por ejemplo)
  const equipoConsumible = await prisma.equipo.upsert({
    where: { numeroSerie: "TONER-001" },
    update: {},
    create: {
      tipoId: tiposMap["Consumible"],
      modeloId: null,
      ubicacionId: ubicacionCentral.id,
      estatusId: estEquipoDisponible.id,
      numeroSerie: "TONER-001",
      notas: "Tóner negro para impresora HP",
    },
  });

  console.log("Equipos base listos");

  // =====================================================
  // 14. EQUIPO_SIM y EQUIPO_CONSUMIBLE
  // =====================================================

  // SIM
  await prisma.equipoSim.upsert({
    where: { equipoId: equipoSim.id },
    update: {},
    create: {
      equipoId: equipoSim.id,
      numeroAsignado: "2295550000",
      imei: "357894561234567",
    },
  });

  // Consumible (asociar color negro)
  await prisma.equipoConsumible.upsert({
    where: { equipoId: equipoConsumible.id },
    update: {},
    create: {
      equipoId: equipoConsumible.id,
      colorId: coloresMap["Negro"],
    },
  });

  console.log("Subtipos de equipo listos");

  // =====================================================
  // 15. ASIGNACIONES
  // =====================================================
  // Creamos una asignación para equipoLaptopAsignado -> usuarioEmployee
  const asignacionLaptop = await prisma.asignacion.create({
    data: {
      equipoId: equipoLaptopAsignado.id,
      usuarioId: usuarioEmployee.id,
      asignadoPor: usuarioAdmin.id,
      // asignadoEn: default now()
      rutaPdf: null,
    },
  });

  console.log("Asignaciones listas:", asignacionLaptop);

  // =====================================================
  // 16. BITÁCORA DE MOVIMIENTOS
  // =====================================================

  // CREAR equipos
  await prisma.bitacoraMovimiento.createMany({
    data: [
      {
        equipoId: equipoLaptopDisponible.id,
        usuarioId: null,
        accion: AccionBitacora.CREAR,
        estatusOrigenId: null,
        estatusDestinoId: estEquipoDisponible.id,
        realizadoPorId: usuarioAdmin.id,
        notas: "Equipo creado en seed (Laptop disponible)",
      },
      {
        equipoId: equipoLaptopAsignado.id,
        usuarioId: null,
        accion: AccionBitacora.CREAR,
        estatusOrigenId: null,
        estatusDestinoId: estEquipoAsignado.id,
        realizadoPorId: usuarioAdmin.id,
        notas: "Equipo creado en seed (Laptop asignada)",
      },
      {
        equipoId: equipoImpresora.id,
        usuarioId: null,
        accion: AccionBitacora.CREAR,
        estatusOrigenId: null,
        estatusDestinoId: estEquipoDisponible.id,
        realizadoPorId: usuarioAdmin.id,
        notas: "Equipo creado en seed (Impresora)",
      },
      {
        equipoId: equipoSim.id,
        usuarioId: null,
        accion: AccionBitacora.CREAR,
        estatusOrigenId: null,
        estatusDestinoId: estEquipoDisponible.id,
        realizadoPorId: usuarioAdmin.id,
        notas: "Equipo creado en seed (SIM)",
      },
      {
        equipoId: equipoConsumible.id,
        usuarioId: null,
        accion: AccionBitacora.CREAR,
        estatusOrigenId: null,
        estatusDestinoId: estEquipoDisponible.id,
        realizadoPorId: usuarioAdmin.id,
        notas: "Equipo creado en seed (Consumible)",
      },
    ],
  });

  // ASIGNAR laptop
  await prisma.bitacoraMovimiento.create({
    data: {
      equipoId: equipoLaptopAsignado.id,
      usuarioId: usuarioEmployee.id,
      accion: AccionBitacora.ASIGNAR,
      estatusOrigenId: estEquipoDisponible.id,
      estatusDestinoId: estEquipoAsignado.id,
      realizadoPorId: usuarioAdmin.id,
      notas: "Asignación inicial de laptop al empleado de prueba",
    },
  });

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

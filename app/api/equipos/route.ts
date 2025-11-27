// app/api/equipos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/equipos
// Permite filtros: ?tipoId=&estatusId=&ubicacionId=&search=&page=&limit=
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipoIdParam = searchParams.get("tipoId");
  const estatusIdParam = searchParams.get("estatusId");
  const ubicacionIdParam = searchParams.get("ubicacionId");
  const search = searchParams.get("search");

  // Paginación
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.EquipoWhereInput = {};

    if (tipoIdParam) {
      const tipoId = Number(tipoIdParam);
      if (!isNaN(tipoId)) where.tipoId = tipoId;
    }

    if (estatusIdParam) {
      const estatusId = Number(estatusIdParam);
      if (!isNaN(estatusId)) where.estatusId = estatusId;
    }

    if (ubicacionIdParam) {
      const ubicacionId = Number(ubicacionIdParam);
      if (!isNaN(ubicacionId)) where.ubicacionId = ubicacionId;
    }

    if (search) {
      where.OR = [
        { numeroSerie: { contains: search, mode: "insensitive" } },
        { notas: { contains: search, mode: "insensitive" } },
        { sim: { numeroAsignado: { contains: search, mode: "insensitive" } } },
        { sim: { imei: { contains: search, mode: "insensitive" } } },
        { modelo: { nombre: { contains: search, mode: "insensitive" } } },
        { tipo: { nombre: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [total, equipos] = await prisma.$transaction([
      prisma.equipo.count({ where }),
      prisma.equipo.findMany({
        where,
        include: {
          tipo: true,
          modelo: {
            include: {
              marcaTipo: {
                include: {
                  marca: true,
                  tipo: true,
                },
              },
            },
          },
          ubicacion: true,
          estatus: true,
          sim: true,
          consumible: {
            include: {
              color: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          id: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      data: equipos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener equipos:", error);
    return NextResponse.json(
      { error: "Error al obtener equipos" },
      { status: 500 }
    );
  }
}

// POST /api/equipos
// Crea un equipo nuevo. Soporta SIMs y Consumibles.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tipoId,
      modeloId,
      ubicacionId,
      estatusId, // opcional
      numeroSerie,
      ipFija,
      puertoEthernet,
      notas,
      simData, // { numeroAsignado, imei }
      consumibleData, // { colorId }
    } = body;

    // Validaciones mínimas
    if (!tipoId || typeof tipoId !== "number") {
      return NextResponse.json(
        { error: "tipoId es obligatorio y debe ser numérico" },
        { status: 400 }
      );
    }

    // Verificar tipo de equipo para validaciones específicas
    const tipoEquipo = await prisma.tipoEquipo.findUnique({ where: { id: tipoId } });
    if (!tipoEquipo) {
      return NextResponse.json({ error: "Tipo de equipo no válido" }, { status: 400 });
    }

    const nombreTipo = tipoEquipo.nombre.toLowerCase();
    const isSim = nombreTipo.includes("sim");
    const isConsumible = nombreTipo.includes("consumible") || nombreTipo.includes("toner");

    // Validaciones específicas
    if (isSim) {
      if (!simData?.numeroAsignado || !simData?.imei) {
        return NextResponse.json(
          { error: "Para equipos SIM, 'numeroAsignado' e 'imei' son obligatorios en 'simData'" },
          { status: 400 }
        );
      }
    }

    if (isConsumible) {
      if (!consumibleData?.colorId) {
        return NextResponse.json(
          { error: "Para consumibles, 'colorId' es obligatorio en 'consumibleData'" },
          { status: 400 }
        );
      }
    }

    // Resolver estatus
    let resolvedEstatusId: number;

    if (estatusId && typeof estatusId === "number") {
      resolvedEstatusId = estatusId;
    } else {
      // Buscar estatus 'Disponible' para EQUIPO
      const estatusDisponible = await prisma.estatus.findFirst({
        where: {
          tipo: TipoEstatus.EQUIPO,
          nombre: "Disponible",
        },
      });

      if (!estatusDisponible) {
        return NextResponse.json(
          {
            error:
              "No se encontró estatus 'Disponible' para EQUIPO. Asegúrate de correr el seed.",
          },
          { status: 500 }
        );
      }

      resolvedEstatusId = estatusDisponible.id;
    }

    // Crear equipo
    const nuevoEquipo = await prisma.equipo.create({
      data: {
        tipoId,
        modeloId: modeloId ?? null,
        ubicacionId: ubicacionId ?? null,
        estatusId: resolvedEstatusId,
        numeroSerie: numeroSerie ?? null,
        ipFija: ipFija ?? null,
        puertoEthernet: puertoEthernet ?? null,
        notas: notas ?? null,
        sim: isSim ? {
          create: {
            numeroAsignado: simData.numeroAsignado,
            imei: simData.imei
          }
        } : undefined,
        consumible: isConsumible ? {
          create: {
            colorId: consumibleData.colorId
          }
        } : undefined
      },
      include: {
        tipo: true,
        modelo: {
          include: {
            marcaTipo: {
              include: {
                marca: true,
                tipo: true,
              },
            },
          },
        },
        ubicacion: true,
        estatus: true,
        sim: true,
        consumible: {
          include: {
            color: true,
          },
        },
      },
    });



    // Registrar en Bitácora
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await registrarBitacora({
        accion: AccionBitacora.CREAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: nuevoEquipo.id,
        autorId: currentUser.id,
        detalles: {
          tipo: nuevoEquipo.tipo.nombre,
          modelo: nuevoEquipo.modelo?.nombre,
          serie: nuevoEquipo.numeroSerie
        }
      });
    }

    return NextResponse.json(nuevoEquipo, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Tipamos meta para poder usar includes
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;

        if (target?.includes("numeroSerie")) {
          return NextResponse.json(
            { error: "Ya existe un equipo con ese número de serie" },
            { status: 409 }
          );
        }
        if (target?.includes("numeroAsignado")) {
          return NextResponse.json(
            { error: "Ya existe una SIM con ese número asignado" },
            { status: 409 }
          );
        }
        if (target?.includes("imei")) {
          return NextResponse.json(
            { error: "Ya existe una SIM con ese IMEI" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al crear equipo" },
      { status: 500 }
    );
  }
}

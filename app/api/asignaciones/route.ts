// app/api/asignaciones/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus } from "@prisma/client";
import { AccionBitacora, SeccionBitacora } from "@/lib/bitacora";

// GET /api/asignaciones
// Filtros opcionales: ?usuarioId=&equipoId=&soloActivas=true
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const usuarioIdParam = searchParams.get("usuarioId");
  const equipoIdParam = searchParams.get("equipoId");
  const soloActivasParam = searchParams.get("soloActivas");

  try {
    const where: Prisma.AsignacionWhereInput = {};

    if (usuarioIdParam) {
      const usuarioId = Number(usuarioIdParam);
      if (!isNaN(usuarioId)) where.usuarioId = usuarioId;
    }

    if (equipoIdParam) {
      const equipoId = Number(equipoIdParam);
      if (!isNaN(equipoId)) where.equipoId = equipoId;
    }

    if (soloActivasParam === "true") {
      // Asignaciones no devueltas
      where.devueltoEn = null;
    }

    const asignaciones = await prisma.asignacion.findMany({
      where,
      include: {
        equipo: {
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
          },
        },
        usuario: true,
        asignador: true,
      },
      orderBy: { asignadoEn: "desc" },
    });

    return NextResponse.json(asignaciones);
  } catch (error: unknown) {
    console.error("Error al obtener asignaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener asignaciones" },
      { status: 500 }
    );
  }
}

// POST /api/asignaciones
// Body esperado:
// {
//   "equipoId": 1,
//   "usuarioId": 2,     // a quién se le asigna
//   "asignadoPor": 3,   // usuario del sistema que realiza la asignación
//   "notas": "opcional"
// }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { equipoId, usuarioId, asignadoPor, notas } = body;

    if (
      typeof equipoId !== "number" ||
      typeof usuarioId !== "number" ||
      typeof asignadoPor !== "number"
    ) {
      return NextResponse.json(
        { error: "equipoId, usuarioId y asignadoPor son obligatorios y numéricos" },
        { status: 400 }
      );
    }

    // 1) Traer equipo y validar que existe
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      include: { estatus: true },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "El equipo no existe" },
        { status: 404 }
      );
    }

    // 2) Validar que el equipo esté en estatus EQUIPO/Disponible
    const estatusDisponible = await prisma.estatus.findFirst({
      where: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Disponible",
      },
    });

    const estatusAsignado = await prisma.estatus.findFirst({
      where: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Asignado",
      },
    });

    if (!estatusDisponible || !estatusAsignado) {
      return NextResponse.json(
        {
          error:
            "No están configurados los estatus 'Disponible' y 'Asignado' para EQUIPO. Asegúrate de correr el seed.",
        },
        { status: 500 }
      );
    }

    if (equipo.estatusId !== estatusDisponible.id) {
      return NextResponse.json(
        {
          error:
            "Solo se pueden asignar equipos con estatus 'Disponible'.",
        },
        { status: 400 }
      );
    }

    // 3) Ejecutar todo en una transacción:
    //    - Crear asignación
    //    - Actualizar estatus del equipo a 'Asignado'
    //    - Registrar bitácora ASIGNAR
    const resultado = await prisma.$transaction(async (tx) => {
      const nuevaAsignacion = await tx.asignacion.create({
        data: {
          equipoId,
          usuarioId,
          asignadoPor,
        },
      });

      await tx.equipo.update({
        where: { id: equipoId },
        data: {
          estatusId: estatusAsignado.id,
        },
      });

      await tx.bitacora.create({
        data: {
          accion: AccionBitacora.ASIGNAR,
          seccion: SeccionBitacora.ASIGNACIONES,
          elementoId: equipoId,
          autorId: asignadoPor,
          detalles: {
            usuarioId,
            estatusOrigenId: estatusDisponible.id,
            estatusDestinoId: estatusAsignado.id,
            notas: notas ?? "Asignación creada",
          },
        },
      });

      // Devolver la asignación con include
      const asignacionCompleta = await tx.asignacion.findUnique({
        where: { id: nuevaAsignacion.id },
        include: {
          equipo: {
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
              consumible: { include: { color: true } },
            },
          },
          usuario: {
            include: {
              puesto: true,
              centro: true,
            },
          },
          asignador: true,
        },
      });

      return asignacionCompleta;
    });

    // Generar PDF automáticamente después de crear la asignación
    if (resultado) {
      try {
        const { generarPdfAsignacion } = await import('@/lib/pdf/generarPdfAsignacion');

        const rutaPdf = await generarPdfAsignacion(
          resultado.usuario,
          [resultado.equipo],
          resultado.asignador
        );

        // Actualizar la asignación con la ruta del PDF
        await prisma.asignacion.update({
          where: { id: resultado.id },
          data: { rutaPdf },
        });

        // Agregar rutaPdf al resultado que se retorna
        resultado.rutaPdf = rutaPdf;
      } catch (pdfError) {
        console.error('Error al generar PDF (la asignación se creó correctamente):', pdfError);
        // No falla la asignación si falla el PDF
      }
    }

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear asignación:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Por ejemplo, si hay alguna constraint única
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Error de integridad referencial (revisa equipoId/usuarioId/asignadoPor).",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear asignación" },
      { status: 500 }
    );
  }
}

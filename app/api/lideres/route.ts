// app/api/lideres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus } from "@prisma/client";

// GET /api/lideres?centroId=&puestoId=&estatusId=&search=
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const centroIdParam = searchParams.get("centroId");
  const puestoIdParam = searchParams.get("puestoId");
  const estatusIdParam = searchParams.get("estatusId");
  const search = searchParams.get("search");

  try {
    const where: Prisma.LiderWhereInput = {};

    if (centroIdParam) {
      const centroId = Number(centroIdParam);
      if (!isNaN(centroId)) where.centroId = centroId;
    }

    if (puestoIdParam) {
      const puestoId = Number(puestoIdParam);
      if (!isNaN(puestoId)) where.puestoId = puestoId;
    }

    if (estatusIdParam) {
      const estatusId = Number(estatusIdParam);
      if (!isNaN(estatusId)) where.estatusId = estatusId;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { apellidoPaterno: { contains: search, mode: "insensitive" } },
        { apellidoMaterno: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const lideres = await prisma.lider.findMany({
      where,
      include: {
        centro: {
          include: { ubicacion: true },
        },
        puesto: true,
        estatus: true,
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(lideres);
  } catch (error) {
    console.error("Error al obtener líderes:", error);
    return NextResponse.json(
      { error: "Error al obtener líderes" },
      { status: 500 }
    );
  }
}

// POST /api/lideres
// Body mínimo:
// {
//   "nombre": "María",
//   "apellidoPaterno": "López",
//   "email": "maria@example.com",
//   "telefono": "229...",
//   "centroId": 1,
//   "puestoId": 1,
//   "estatusId":  ?   (opcional, si no se manda se usa PERSONAL/Activo)
// }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      email,
      telefono,
      centroId,
      puestoId,
      estatusId,
    } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "El campo 'email' es obligatorio" },
        { status: 400 }
      );
    }

    if (typeof centroId !== "number" || typeof puestoId !== "number") {
      return NextResponse.json(
        { error: "centroId y puestoId son obligatorios y numéricos" },
        { status: 400 }
      );
    }

    let resolvedEstatusId: number;

    if (typeof estatusId === "number") {
      resolvedEstatusId = estatusId;
    } else {
      const estatusActivo = await prisma.estatus.findFirst({
        where: {
          tipo: TipoEstatus.PERSONAL,
          nombre: "Activo",
        },
      });

      if (!estatusActivo) {
        return NextResponse.json(
          {
            error:
              "No se encontró estatus 'Activo' de tipo PERSONAL. Revisa el seed.",
          },
          { status: 500 }
        );
      }

      resolvedEstatusId = estatusActivo.id;
    }

    const lider = await prisma.lider.create({
      data: {
        nombre,
        apellidoPaterno: apellidoPaterno ?? null,
        apellidoMaterno: apellidoMaterno ?? null,
        email,
        telefono: telefono ?? null,
        centroId,
        puestoId,
        estatusId: resolvedEstatusId,
      },
      include: {
        centro: {
          include: { ubicacion: true },
        },
        puesto: true,
        estatus: true,
      },
    });

    return NextResponse.json(lider, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear líder:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;

        if (target?.includes("email")) {
          return NextResponse.json(
            { error: "Ya existe un líder con ese correo electrónico" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al crear líder" },
      { status: 500 }
    );
  }
}

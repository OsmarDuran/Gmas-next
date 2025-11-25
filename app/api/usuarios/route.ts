// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

// GET /api/usuarios
// Filtros opcionales: ?rolId=&activo=&centroId=&liderId=&search=
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rolIdParam = searchParams.get("rolId");
  const activoParam = searchParams.get("activo");
  const centroIdParam = searchParams.get("centroId");
  const liderIdParam = searchParams.get("liderId");
  const search = searchParams.get("search");

  // Paginación
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.UsuarioWhereInput = {};

    if (rolIdParam) {
      const rolId = Number(rolIdParam);
      if (!isNaN(rolId)) where.rolId = rolId;
    }

    if (centroIdParam) {
      const centroId = Number(centroIdParam);
      if (!isNaN(centroId)) where.centroId = centroId;
    }

    if (liderIdParam) {
      const liderId = Number(liderIdParam);
      if (!isNaN(liderId)) where.liderId = liderId;
    }

    if (activoParam === "true") where.activo = true;
    if (activoParam === "false") where.activo = false;

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { apellidoPaterno: { contains: search, mode: "insensitive" } },
        { apellidoMaterno: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, usuarios] = await prisma.$transaction([
      prisma.usuario.count({ where }),
      prisma.usuario.findMany({
        where,
        include: {
          rol: true,
          puesto: true,
          centro: true,
          lider: true,
          _count: {
            select: { asignaciones: { where: { devueltoEn: null } } },
          },
        },
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
    ]);

    return NextResponse.json({
      data: usuarios,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/usuarios
// Body esperado:
// {
//   "nombre": "Juan",
//   "apellidoPaterno": "Pérez",
//   "apellidoMaterno": "López",
//   "email": "juan@example.com",
//   "telefono": "229...",
//   "liderId": 1,
//   "puestoId": 1,
//   "centroId": 1,
//   "rolId": 2,
//   "password": "secreto123"
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
      liderId,
      puestoId,
      centroId,
      rolId,
      password,
    } = body;

    // Validaciones mínimas
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

    if (
      typeof liderId !== "number" ||
      typeof puestoId !== "number" ||
      typeof centroId !== "number" ||
      typeof rolId !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "liderId, puestoId, centroId y rolId son obligatorios y deben ser numéricos",
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "El campo 'password' es obligatorio" },
        { status: 400 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        apellidoPaterno: apellidoPaterno ?? null,
        apellidoMaterno: apellidoMaterno ?? null,
        email,
        telefono: telefono ?? null,
        liderId,
        puestoId,
        centroId,
        rolId,
        hashPassword,
        // activo: default true
        // creadoEn: default now()
      },
      include: {
        rol: true,
        puesto: true,
        centro: true,
        lider: true,
      },
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear usuario:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint: email
      if (error.code === "P2002") {
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;

        if (target?.includes("email")) {
          return NextResponse.json(
            { error: "Ya existe un usuario con ese correo electrónico" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}

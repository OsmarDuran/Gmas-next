// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

function getIdFromParams(params: { id?: string }): number | null {
  const raw = params.id;
  if (!raw) return null;
  const id = Number(raw);
  if (isNaN(id)) return null;
  return id;
}

// GET /api/usuarios/:id
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: true,
        puesto: true,
        centro: true,
        lider: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error: unknown) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PATCH /api/usuarios/:id
// Body: campos opcionales; si envías password, se vuelve a hashear
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

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
      activo,
    } = body;

    const data: Prisma.UsuarioUpdateInput = {};

    if (typeof nombre === "string") data.nombre = nombre;
    if (apellidoPaterno !== undefined)
      data.apellidoPaterno = apellidoPaterno;
    if (apellidoMaterno !== undefined)
      data.apellidoMaterno = apellidoMaterno;
    if (typeof email === "string") data.email = email;
    if (telefono !== undefined) data.telefono = telefono;

    if (typeof liderId === "number") data.lider = { connect: { id: liderId } };
    if (typeof puestoId === "number") data.puesto = { connect: { id: puestoId } };
    if (typeof centroId === "number") data.centro = { connect: { id: centroId } };
    if (typeof rolId === "number") data.rol = { connect: { id: rolId } };

    if (typeof activo === "boolean") data.activo = activo;

    if (typeof password === "string" && password.length > 0) {
      const hashPassword = await bcrypt.hash(password, 10);
      data.hashPassword = hashPassword;
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data,
      include: {
        rol: true,
        puesto: true,
        centro: true,
        lider: true,
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error: unknown) {
    console.error("Error al actualizar usuario:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE /api/usuarios/:id
// Ojo: esto BORRA el registro. Si prefieres baja lógica, usa PATCH con activo=false.
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al eliminar usuario:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "No se puede eliminar el usuario porque tiene relaciones (asignaciones, bitácora, etc.)",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}

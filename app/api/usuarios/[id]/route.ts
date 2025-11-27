// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

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
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);
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
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    // Validación de seguridad para contraseña
    if (typeof password === "string" && password.length > 0) {
      // Solo el rol 'master' puede cambiar contraseñas
      // Verificamos el rol del usuario actual en la BD
      const currentUserWithRole = await prisma.usuario.findUnique({
        where: { id: currentUser.id },
        include: { rol: true }
      });

      if (currentUserWithRole?.rol.nombre !== 'master') {
        return NextResponse.json(
          { error: "Solo el usuario Master puede cambiar contraseñas." },
          { status: 403 }
        );
      }

      const hashPassword = await bcrypt.hash(password, 10);
      data.hashPassword = hashPassword;
    }

    // Obtener usuario actual para comparar cambios
    const usuarioActual = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioActual) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const cambios: Record<string, { anterior: any; nuevo: any }> = {};

    if (nombre !== undefined && nombre !== usuarioActual.nombre) cambios.nombre = { anterior: usuarioActual.nombre, nuevo: nombre };
    if (apellidoPaterno !== undefined && apellidoPaterno !== usuarioActual.apellidoPaterno) cambios.apellidoPaterno = { anterior: usuarioActual.apellidoPaterno, nuevo: apellidoPaterno };
    if (apellidoMaterno !== undefined && apellidoMaterno !== usuarioActual.apellidoMaterno) cambios.apellidoMaterno = { anterior: usuarioActual.apellidoMaterno, nuevo: apellidoMaterno };
    if (email !== undefined && email !== usuarioActual.email) cambios.email = { anterior: usuarioActual.email, nuevo: email };
    if (telefono !== undefined && telefono !== usuarioActual.telefono) cambios.telefono = { anterior: usuarioActual.telefono, nuevo: telefono };

    if (liderId !== undefined && liderId !== usuarioActual.liderId) cambios.lider = { anterior: usuarioActual.liderId, nuevo: liderId };
    if (puestoId !== undefined && puestoId !== usuarioActual.puestoId) cambios.puesto = { anterior: usuarioActual.puestoId, nuevo: puestoId };
    if (centroId !== undefined && centroId !== usuarioActual.centroId) cambios.centro = { anterior: usuarioActual.centroId, nuevo: centroId };
    if (rolId !== undefined && rolId !== usuarioActual.rolId) cambios.rol = { anterior: usuarioActual.rolId, nuevo: rolId };

    if (activo !== undefined && activo !== usuarioActual.activo) cambios.activo = { anterior: usuarioActual.activo, nuevo: activo };

    if (typeof password === "string" && password.length > 0) {
      cambios.password = { anterior: "********", nuevo: "********" }; // No guardar hash, solo indicar cambio
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

    // Bitácora
    if (Object.keys(cambios).length > 0) {
      await registrarBitacora({
        accion: AccionBitacora.MODIFICAR,
        seccion: SeccionBitacora.USUARIOS,
        elementoId: usuarioActualizado.id,
        autorId: currentUser.id,
        detalles: { cambios }
      });
    }

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
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const usuarioEliminado = await prisma.usuario.delete({
      where: { id },
    });

    // Bitácora
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await registrarBitacora({
        accion: AccionBitacora.ELIMINAR,
        seccion: SeccionBitacora.USUARIOS,
        elementoId: id,
        autorId: currentUser.id,
        detalles: { nombre: usuarioEliminado.nombre, email: usuarioEliminado.email }
      });
    }

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

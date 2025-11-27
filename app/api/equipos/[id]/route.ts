// app/api/equipos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// Helper para parsear id de la URL
function getIdFromParams(params: { id?: string }): number | null {
  const raw = params.id;
  if (!raw) return null;
  const id = Number(raw);
  return isNaN(id) ? null : id;
}

// GET /api/equipos/:id
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id },
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
          include: { color: true },
        },
        asignaciones: {
          include: {
            usuario: true,
            asignador: true,
          },
        },
      },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipo);
  } catch (error: unknown) {
    console.error("Error al obtener equipo:", error);
    return NextResponse.json(
      { error: "Error al obtener equipo" },
      { status: 500 }
    );
  }
}

// PATCH /api/equipos/:id
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const {
      tipoId,
      modeloId,
      ubicacionId,
      estatusId,
      numeroSerie,
      ipFija,
      puertoEthernet,
      notas,
    } = body;

    const data: Prisma.EquipoUpdateInput = {};

    if (typeof tipoId === "number") data.tipo = { connect: { id: tipoId } };

    // Manejo de modeloId: si es null explícito, desconectamos. Si es número, conectamos.
    if (modeloId === null) {
      data.modelo = { disconnect: true };
    } else if (typeof modeloId === "number") {
      data.modelo = { connect: { id: modeloId } };
    }

    // Manejo de ubicacionId
    if (ubicacionId === null) {
      data.ubicacion = { disconnect: true };
    } else if (typeof ubicacionId === "number") {
      data.ubicacion = { connect: { id: ubicacionId } };
    }

    // Obtener equipo actual para validaciones
    const equipoActual = await prisma.equipo.findUnique({
      where: { id },
      include: {
        estatus: true,
        sim: true,
        consumible: true,
        asignaciones: {
          where: { devueltoEn: null }
        }
      }
    });

    if (!equipoActual) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    // Obtener ID del estatus "Asignado"
    const estatusAsignado = await prisma.estatus.findFirst({
      where: { nombre: "Asignado", tipo: "EQUIPO" }
    });

    if (typeof estatusId === "number") {
      // Regla 1: No permitir poner estatus "Asignado" manualmente
      if (estatusAsignado && estatusId === estatusAsignado.id) {
        return NextResponse.json(
          { error: "No se puede cambiar el estatus a 'Asignado' manualmente. Debe realizar una asignación." },
          { status: 400 }
        );
      }

      // Regla 2: Si estaba asignado y cambia de estatus, cerrar asignación (devolución implícita)
      if (equipoActual.estatus.nombre === "Asignado" && estatusAsignado && estatusId !== estatusAsignado.id) {
        // Buscar asignación activa
        const asignacionActiva = equipoActual.asignaciones[0];
        if (asignacionActiva) {
          await prisma.asignacion.update({
            where: { id: asignacionActiva.id },
            data: { devueltoEn: new Date() }
          });

          // Registrar devolución en bitácora
          const currentUser = await getCurrentUser();
          if (currentUser) {
            await registrarBitacora({
              accion: AccionBitacora.DEVOLVER,
              seccion: SeccionBitacora.ASIGNACIONES,
              elementoId: id,
              autorId: currentUser.id,
              detalles: {
                asignacionId: asignacionActiva.id,
                motivo: "Cambio de estatus manual en edición de equipo",
                nuevoEstatusId: estatusId
              }
            });
          }
        }
      }

      data.estatus = { connect: { id: estatusId } };
    }

    if (numeroSerie !== undefined) data.numeroSerie = numeroSerie;
    if (ipFija !== undefined) data.ipFija = ipFija;
    if (puertoEthernet !== undefined) data.puertoEthernet = puertoEthernet;
    if (notas !== undefined) data.notas = notas;

    // Calcular cambios para bitácora (Anterior -> Nuevo)
    const cambios: Record<string, { anterior: any; nuevo: any }> = {};

    if (tipoId !== undefined && tipoId !== equipoActual.tipoId) {
      cambios.tipo = { anterior: equipoActual.tipoId, nuevo: tipoId };
    }
    if (modeloId !== undefined && modeloId !== equipoActual.modeloId) {
      cambios.modelo = { anterior: equipoActual.modeloId, nuevo: modeloId };
    }
    if (ubicacionId !== undefined && ubicacionId !== equipoActual.ubicacionId) {
      cambios.ubicacion = { anterior: equipoActual.ubicacionId, nuevo: ubicacionId };
    }
    if (estatusId !== undefined && estatusId !== equipoActual.estatusId) {
      cambios.estatus = { anterior: equipoActual.estatusId, nuevo: estatusId };
    }
    if (numeroSerie !== undefined && numeroSerie !== equipoActual.numeroSerie) {
      cambios.numeroSerie = { anterior: equipoActual.numeroSerie, nuevo: numeroSerie };
    }
    if (ipFija !== undefined && ipFija !== equipoActual.ipFija) {
      cambios.ipFija = { anterior: equipoActual.ipFija, nuevo: ipFija };
    }
    if (puertoEthernet !== undefined && puertoEthernet !== equipoActual.puertoEthernet) {
      cambios.puertoEthernet = { anterior: equipoActual.puertoEthernet, nuevo: puertoEthernet };
    }
    if (notas !== undefined && notas !== equipoActual.notas) {
      cambios.notas = { anterior: equipoActual.notas, nuevo: notas };
    }

    // Manejo de datos específicos (SIM / Consumible)
    const { simData, consumibleData } = body;

    if (simData) {
      const { numeroAsignado, imei } = simData;

      // Verificar cambios para bitácora
      if (equipoActual.sim) {
        if (numeroAsignado !== undefined && numeroAsignado !== equipoActual.sim.numeroAsignado) {
          cambios.simNumero = { anterior: equipoActual.sim.numeroAsignado, nuevo: numeroAsignado };
        }
        if (imei !== undefined && imei !== equipoActual.sim.imei) {
          cambios.simImei = { anterior: equipoActual.sim.imei, nuevo: imei };
        }
      } else {
        // Si no tenía SIM y ahora sí (caso raro en edición pero posible si cambió tipo)
        cambios.simNumero = { anterior: null, nuevo: numeroAsignado };
        cambios.simImei = { anterior: null, nuevo: imei };
      }

      data.sim = {
        upsert: {
          create: { numeroAsignado, imei },
          update: { numeroAsignado, imei }
        }
      };
    }

    if (consumibleData) {
      const { colorId } = consumibleData;
      const nuevoColorId = Number(colorId);

      // Verificar cambios para bitácora
      if (equipoActual.consumible) {
        if (nuevoColorId !== equipoActual.consumible.colorId) {
          // Necesitaríamos el nombre del color anterior para ser más descriptivos, pero el ID sirve
          cambios.colorId = { anterior: equipoActual.consumible.colorId, nuevo: nuevoColorId };
        }
      } else {
        cambios.colorId = { anterior: null, nuevo: nuevoColorId };
      }

      data.consumible = {
        upsert: {
          create: { colorId: nuevoColorId },
          update: { colorId: nuevoColorId }
        }
      };
    }

    const equipoActualizado = await prisma.equipo.update({
      where: { id },
      data,
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
    });

    // Bitácora
    const currentUser = await getCurrentUser();
    if (currentUser && Object.keys(cambios).length > 0) {
      await registrarBitacora({
        accion: AccionBitacora.MODIFICAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: id,
        autorId: currentUser.id,
        detalles: { cambios }
      });
    }

    return NextResponse.json(equipoActualizado);
  } catch (error: unknown) {
    console.error("Error al actualizar equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error P2002: violación de unique (ej: número de serie)
      if (error.code === "P2002") {
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;
        if (target?.includes("numeroSerie")) {
          return NextResponse.json(
            { error: "Ya existe un equipo con ese número de serie" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al actualizar equipo" },
      { status: 500 }
    );
  }
}

// DELETE /api/equipos/:id
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const equipoEliminado = await prisma.equipo.delete({
      where: { id },
    });

    // Bitácora
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await registrarBitacora({
        accion: AccionBitacora.ELIMINAR,
        seccion: SeccionBitacora.EQUIPOS,
        elementoId: id,
        autorId: currentUser.id,
        detalles: { serie: equipoEliminado.numeroSerie, tipoId: equipoEliminado.tipoId }
      });
    }

    return NextResponse.json(
      { message: "Equipo eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al eliminar equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error de integridad referencial (tiene asignaciones, bitácora, etc.)
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "No se puede eliminar el equipo porque tiene relaciones (asignaciones, bitácora, etc.)",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar equipo" },
      { status: 500 }
    );
  }
}

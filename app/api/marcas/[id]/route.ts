import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// ... (GET se mantiene igual)

// PUT /api/marcas/[id]
// Body esperado: FormData { nombre?, notas?, activo?, logo? }
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const marcaId = Number(id);

        if (isNaN(marcaId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const nombre = formData.get("nombre") as string | null;
        const notas = formData.get("notas") as string | null;
        const activoStr = formData.get("activo") as string | null;
        const logo = formData.get("logo") as File | null;

        // Obtener estado anterior para bitácora
        const marcaAnterior = await prisma.marca.findUnique({ where: { id: marcaId } });
        if (!marcaAnterior) {
            return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
        }

        const dataToUpdate: Prisma.MarcaUpdateInput = {};
        const cambios: any = {};

        if (nombre !== null) {
            if (nombre.trim() === "") {
                return NextResponse.json(
                    { error: "El campo 'nombre' debe ser una cadena no vacía" },
                    { status: 400 }
                );
            }
            dataToUpdate.nombre = nombre;
            if (nombre !== marcaAnterior.nombre) cambios.nombre = { anterior: marcaAnterior.nombre, nuevo: nombre };
        }

        if (notas !== null) {
            dataToUpdate.notas = notas || null;
            if ((notas || null) !== marcaAnterior.notas) cambios.notas = { anterior: marcaAnterior.notas, nuevo: notas || null };
        }

        if (activoStr !== null) {
            const nuevoActivo = activoStr === "true";
            dataToUpdate.activo = nuevoActivo;
            if (nuevoActivo !== marcaAnterior.activo) cambios.activo = { anterior: marcaAnterior.activo, nuevo: nuevoActivo };
        }

        if (logo) {
            const buffer = Buffer.from(await logo.arrayBuffer());
            const safeName = logo.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `marca-${Date.now()}-${safeName}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "marcas");

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);

            dataToUpdate.logoUrl = `/uploads/marcas/${filename}`;
            cambios.logoUrl = { anterior: marcaAnterior.logoUrl, nuevo: dataToUpdate.logoUrl };

            // Intentar borrar logo anterior
            try {
                if (marcaAnterior?.logoUrl) {
                    const oldPath = path.join(process.cwd(), "public", marcaAnterior.logoUrl);
                    if (fs.existsSync(oldPath)) {
                        await unlink(oldPath);
                    }
                }
            } catch (e) {
                console.warn("No se pudo eliminar el logo anterior:", e);
            }
        }

        const marcaActualizada = await prisma.marca.update({
            where: { id: marcaId },
            data: dataToUpdate,
        });

        if (Object.keys(cambios).length > 0) {
            await registrarBitacora({
                accion: AccionBitacora.MODIFICAR,
                seccion: SeccionBitacora.MARCAS,
                elementoId: marcaId,
                autorId: user.id,
                detalles: { cambios }
            });
        }

        return NextResponse.json(marcaActualizada);
    } catch (error: unknown) {
        console.error("Error al actualizar marca:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Marca no encontrada" },
                    { status: 404 }
                );
            }
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "Ya existe una marca con ese nombre" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Error al actualizar marca" },
            { status: 500 }
        );
    }
}

// DELETE /api/marcas/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const marcaId = Number(id);

        if (isNaN(marcaId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        // Soft delete
        const marcaEliminada = await prisma.marca.update({
            where: { id: marcaId },
            data: { activo: false },
        });

        await registrarBitacora({
            accion: AccionBitacora.ELIMINAR,
            seccion: SeccionBitacora.MARCAS,
            elementoId: marcaId,
            autorId: user.id,
            detalles: { nombre: marcaEliminada.nombre }
        });

        return NextResponse.json(marcaEliminada);
    } catch (error: unknown) {
        console.error("Error al eliminar marca:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Marca no encontrada" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Error al eliminar marca" },
            { status: 500 }
        );
    }
}

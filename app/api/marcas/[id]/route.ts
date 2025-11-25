import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

// GET /api/marcas/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const marcaId = Number(id);

        if (isNaN(marcaId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const marca = await prisma.marca.findUnique({
            where: { id: marcaId },
            include: {
                tipos: {
                    include: {
                        tipo: true,
                    },
                },
            },
        });

        if (!marca) {
            return NextResponse.json(
                { error: "Marca no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(marca);
    } catch (error: unknown) {
        console.error("Error al obtener marca:", error);
        return NextResponse.json(
            { error: "Error al obtener marca" },
            { status: 500 }
        );
    }
}

// PUT /api/marcas/[id]
// Body esperado: FormData { nombre?, notas?, activo?, logo? }
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        const dataToUpdate: Prisma.MarcaUpdateInput = {};

        if (nombre !== null) {
            if (nombre.trim() === "") {
                return NextResponse.json(
                    { error: "El campo 'nombre' debe ser una cadena no vacía" },
                    { status: 400 }
                );
            }
            dataToUpdate.nombre = nombre;
        }

        if (notas !== null) {
            dataToUpdate.notas = notas || null;
        }

        if (activoStr !== null) {
            dataToUpdate.activo = activoStr === "true";
        }

        if (logo) {
            const buffer = Buffer.from(await logo.arrayBuffer());
            const safeName = logo.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const filename = `marca-${Date.now()}-${safeName}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "marcas");

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);

            dataToUpdate.logoUrl = `/uploads/marcas/${filename}`;

            // Intentar borrar logo anterior
            try {
                const marcaAnterior = await prisma.marca.findUnique({ where: { id: marcaId } });
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

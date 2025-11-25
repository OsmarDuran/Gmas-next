import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipoIdParam = searchParams.get("tipoId");

  try {
    // Sin filtro: todas las marcas activas
    if (!tipoIdParam) {
      const marcas = await prisma.marca.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      });
      return NextResponse.json(marcas);
    }

    const tipoId = Number(tipoIdParam);
    if (isNaN(tipoId)) {
      return NextResponse.json(
        { error: "tipoId debe ser un número" },
        { status: 400 }
      );
    }

    // Marcas asociadas a ese tipo (via MarcaTipo)
    const marcas = await prisma.marca.findMany({
      where: {
        activo: true,
        tipos: {
          some: { tipoId },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(marcas);
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return NextResponse.json(
      { error: "Error al obtener marcas" },
      { status: 500 }
    );
  }
}

// POST /api/marcas
// Body esperado: FormData { nombre, notas?, logo? }
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const notas = formData.get("notas") as string | null;
    const logo = formData.get("logo") as File | null;

    if (!nombre) {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    let logoUrl = null;

    if (logo) {
      const buffer = Buffer.from(await logo.arrayBuffer());
      // Sanitizar nombre de archivo
      const safeName = logo.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const filename = `marca-${Date.now()}-${safeName}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "marcas");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      logoUrl = `/uploads/marcas/${filename}`;
    }

    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre,
        notas: notas ?? null,
        logoUrl,
      },
    });

    return NextResponse.json(nuevaMarca, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear marca:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe una marca con ese nombre" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear marca" },
      { status: 500 }
    );
  }
}

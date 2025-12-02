import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarPdfAsignacion } from "@/lib/pdf/generarPdfAsignacion";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const usuarioId = searchParams.get("usuarioId");
    const timestamp = searchParams.get("ts");

    if (!usuarioId || !timestamp) {
        return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    try {
        // Buscar asignaciones para este usuario creadas en este timestamp (con margen de 1 segundo)
        const date = new Date(Number(timestamp));
        const start = new Date(date.getTime() - 1000);
        const end = new Date(date.getTime() + 1000);

        const asignaciones = await prisma.asignacion.findMany({
            where: {
                usuarioId: Number(usuarioId),
                asignadoEn: {
                    gte: start,
                    lte: end
                },
                devueltoEn: null
            },
            include: {
                equipo: {
                    include: {
                        tipo: true,
                        modelo: { include: { marcaTipo: { include: { marca: true } } } },
                        sim: true,
                        consumible: { include: { color: true } }
                    }
                },
                asignador: true
            }
        });

        if (asignaciones.length === 0) {
            return NextResponse.json({ error: "No se encontraron asignaciones" }, { status: 404 });
        }

        const usuarioCompleto = await prisma.usuario.findUnique({
            where: { id: Number(usuarioId) },
            include: { puesto: true, centro: true }
        });

        if (!usuarioCompleto) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const usuarioParaPdf = {
            ...usuarioCompleto,
            puesto: usuarioCompleto.puesto!,
            centro: usuarioCompleto.centro!
        };

        const equipos = asignaciones.map(a => a.equipo);
        const encargado = asignaciones[0].asignador;

        const pdfBuffer = await generarPdfAsignacion(usuarioParaPdf, equipos, encargado);

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="resguardo-${usuarioId}-${timestamp}.pdf"`
            }
        });

    } catch (error) {
        console.error("Error generando PDF:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

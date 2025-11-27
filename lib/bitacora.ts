import { prisma } from "@/lib/prisma";

export enum AccionBitacora {
    CREAR = "CREAR",
    MODIFICAR = "MODIFICAR",
    ELIMINAR = "ELIMINAR",
    ASIGNAR = "ASIGNAR",
    DEVOLVER = "DEVOLVER",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    OTRO = "OTRO"
}

export enum SeccionBitacora {
    EQUIPOS = "EQUIPOS",
    USUARIOS = "USUARIOS",
    ASIGNACIONES = "ASIGNACIONES",
    MARCAS = "MARCAS",
    MODELOS = "MODELOS",
    UBICACIONES = "UBICACIONES",
    CENTROS = "CENTROS",
    PUESTOS = "PUESTOS",
    TIPOS = "TIPOS",
    AUTH = "AUTH"
}

interface RegistrarBitacoraParams {
    accion: string;
    seccion: string;
    elementoId?: number;
    autorId: number;
    detalles?: any;
}

export async function registrarBitacora({
    accion,
    seccion,
    elementoId,
    autorId,
    detalles
}: RegistrarBitacoraParams) {
    try {
        await prisma.bitacora.create({
            data: {
                accion,
                seccion,
                elementoId,
                autorId,
                detalles: detalles ? detalles : undefined
            }
        });
    } catch (error) {
        console.error("Error registrando bitácora:", error);
        // No lanzamos error para no interrumpir el flujo principal si falla el log
    }
}

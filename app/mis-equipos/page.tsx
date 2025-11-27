"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import { Asignacion, Equipo, Modelo, TipoEquipo, Marca } from "@prisma/client";
import { Loader2, Package, Calendar } from "lucide-react";

type AsignacionConDetalles = Asignacion & {
    equipo: Equipo & {
        tipo: TipoEquipo;
        modelo: Modelo & {
            marca: Marca;
        };
    };
};

export default function MisEquiposPage() {
    const { user } = useAuth();
    const [asignaciones, setAsignaciones] = useState<AsignacionConDetalles[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchAsignaciones();
        }
    }, [user]);

    const fetchAsignaciones = async () => {
        try {
            // Necesitamos un endpoint que devuelva las asignaciones del usuario actual
            // Podemos usar /api/usuarios/[id] si incluye asignaciones, o filtrar /api/asignaciones
            // Por ahora, asumiremos que /api/usuarios/[id] devuelve asignaciones activas
            const res = await fetch(`/api/usuarios/${user!.id}`);
            const data = await res.json();

            if (data.asignaciones) {
                // Filtrar solo las activas si el endpoint devuelve todas
                const activas = data.asignaciones.filter((a: any) => a.activo);
                setAsignaciones(activas);
            }
        } catch (error) {
            console.error("Error fetching asignaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mis Equipos Asignados</h1>

            {asignaciones.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes equipos asignados</h3>
                    <p className="text-gray-500 dark:text-gray-400">Contacta a soporte si crees que es un error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {asignaciones.map((asignacion) => (
                        <div key={asignacion.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Activo
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {asignacion.equipo.tipo.nombre}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {asignacion.equipo.modelo?.marca.nombre} {asignacion.equipo.modelo?.nombre}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Serie:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{asignacion.equipo.numeroSerie}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Asignado el:</span>
                                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(asignacion.asignadoEn).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

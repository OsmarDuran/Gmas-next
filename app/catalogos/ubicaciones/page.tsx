"use client";

import { useState, useEffect } from "react";
import { Ubicacion, Estatus } from "@prisma/client";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { UbicacionesTable } from "@/app/components/catalogos/UbicacionesTable";
import { UbicacionForm } from "@/app/components/catalogos/UbicacionForm";
import Link from "next/link";

type UbicacionCompleta = Ubicacion & {
    estatus: Estatus;
};

export default function UbicacionesPage() {
    const [ubicaciones, setUbicaciones] = useState<UbicacionCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingUbicacion, setEditingUbicacion] = useState<UbicacionCompleta | null>(null);

    const fetchUbicaciones = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ubicaciones");
            const data = await res.json();
            if (Array.isArray(data)) {
                setUbicaciones(data);
            }
        } catch (error) {
            console.error("Error fetching ubicaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUbicaciones();
    }, []);

    const handleCreate = () => {
        setEditingUbicacion(null);
        setView('create');
    };

    const handleEdit = (ubicacion: UbicacionCompleta) => {
        setEditingUbicacion(ubicacion);
        setView('edit');
    };

    const handleDelete = async (ubicacion: Ubicacion) => {
        if (!confirm(`¿Estás seguro de eliminar la ubicación "${ubicacion.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/ubicaciones/${ubicacion.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchUbicaciones();
            }
        } catch (error) {
            console.error("Error deleting ubicacion:", error);
        }
    };

    const handleSuccess = () => {
        setView('list');
        setEditingUbicacion(null);
        fetchUbicaciones();
    };

    const handleCancel = () => {
        setView('list');
        setEditingUbicacion(null);
    };

    if (loading && view === 'list' && ubicaciones.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/catalogos"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {view === 'list' ? 'Gestión de Ubicaciones' : view === 'create' ? 'Nueva Ubicación' : 'Editar Ubicación'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {view === 'list' ? 'Administra las sedes y oficinas.' : 'Completa la información de la ubicación.'}
                        </p>
                    </div>
                </div>

                {view === 'list' && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Ubicación
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <UbicacionesTable
                    ubicaciones={ubicaciones}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <UbicacionForm
                        initialData={editingUbicacion}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

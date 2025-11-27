"use client";

import { useState, useEffect } from "react";
import { Centro, Ubicacion } from "@prisma/client";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { CentrosTable } from "@/app/components/catalogos/CentrosTable";
import { CentroForm } from "@/app/components/catalogos/CentroForm";
import Link from "next/link";

type CentroCompleto = Centro & {
    ubicacion: Ubicacion;
};

export default function CentrosPage() {
    const [centros, setCentros] = useState<CentroCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingCentro, setEditingCentro] = useState<CentroCompleto | null>(null);

    const fetchCentros = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/centros");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCentros(data);
            }
        } catch (error) {
            console.error("Error fetching centros:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCentros();
    }, []);

    const handleCreate = () => {
        setEditingCentro(null);
        setView('create');
    };

    const handleEdit = (centro: CentroCompleto) => {
        setEditingCentro(centro);
        setView('edit');
    };

    const handleDelete = async (centro: Centro) => {
        if (!confirm(`¿Estás seguro de eliminar el centro "${centro.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/centros/${centro.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCentros();
            }
        } catch (error) {
            console.error("Error deleting centro:", error);
        }
    };

    const handleSuccess = () => {
        setView('list');
        setEditingCentro(null);
        fetchCentros();
    };

    const handleCancel = () => {
        setView('list');
        setEditingCentro(null);
    };

    if (loading && view === 'list' && centros.length === 0) {
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
                            {view === 'list' ? 'Gestión de Centros de Costo' : view === 'create' ? 'Nuevo Centro' : 'Editar Centro'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {view === 'list' ? 'Administra los centros de costo y su ubicación.' : 'Completa la información del centro.'}
                        </p>
                    </div>
                </div>

                {view === 'list' && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Centro
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <CentrosTable
                    centros={centros}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <CentroForm
                        initialData={editingCentro}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

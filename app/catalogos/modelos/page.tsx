"use client";

import { useState, useEffect } from "react";
import { Modelo, Marca, TipoEquipo } from "@prisma/client";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { ModelosTable } from "@/app/components/catalogos/ModelosTable";
import { ModeloForm } from "@/app/components/catalogos/ModeloForm";
import Link from "next/link";

type ModeloCompleto = Modelo & {
    marcaTipo: {
        marca: Marca;
        tipo: TipoEquipo;
    };
};

export default function ModelosPage() {
    const [modelos, setModelos] = useState<ModeloCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);

    const fetchModelos = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/modelos");
            const data = await res.json();
            if (Array.isArray(data)) {
                setModelos(data);
            }
        } catch (error) {
            console.error("Error fetching modelos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModelos();
    }, []);

    const handleCreate = () => {
        setEditingModelo(null);
        setView('create');
    };

    const handleEdit = (modelo: Modelo) => {
        setEditingModelo(modelo);
        setView('edit');
    };

    const handleDelete = async (modelo: Modelo) => {
        if (!confirm(`¿Estás seguro de eliminar el modelo "${modelo.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/modelos/${modelo.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchModelos();
            }
        } catch (error) {
            console.error("Error deleting modelo:", error);
        }
    };

    const handleSuccess = () => {
        setView('list');
        setEditingModelo(null);
        fetchModelos();
    };

    const handleCancel = () => {
        setView('list');
        setEditingModelo(null);
    };

    if (loading && view === 'list' && modelos.length === 0) {
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
                            {view === 'list' ? 'Gestión de Modelos' : view === 'create' ? 'Nuevo Modelo' : 'Editar Modelo'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {view === 'list' ? 'Administra los modelos de equipos.' : 'Completa la información del modelo.'}
                        </p>
                    </div>
                </div>

                {view === 'list' && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Modelo
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <ModelosTable
                    modelos={modelos}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <ModeloForm
                        initialData={editingModelo}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

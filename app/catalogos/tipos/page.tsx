"use client";

import { useState, useEffect } from "react";
import { TipoEquipo } from "@prisma/client";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { TiposEquipoTable } from "@/app/components/catalogos/TiposEquipoTable";
import { TipoEquipoForm } from "@/app/components/catalogos/TipoEquipoForm";
import Link from "next/link";

export default function TiposEquipoPage() {
    const [tipos, setTipos] = useState<TipoEquipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingTipo, setEditingTipo] = useState<TipoEquipo | null>(null);

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tipos-equipo");
            const data = await res.json();
            if (Array.isArray(data)) {
                setTipos(data);
            }
        } catch (error) {
            console.error("Error fetching tipos de equipo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipos();
    }, []);

    const handleCreate = () => {
        setEditingTipo(null);
        setView('create');
    };

    const handleEdit = (tipo: TipoEquipo) => {
        setEditingTipo(tipo);
        setView('edit');
    };

    const handleDelete = async (tipo: TipoEquipo) => {
        if (!confirm(`¿Estás seguro de eliminar el tipo "${tipo.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/tipos-equipo/${tipo.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchTipos();
            } else {
                const data = await res.json();
                alert(data.error || "Error al eliminar");
            }
        } catch (error) {
            console.error("Error deleting tipo:", error);
        }
    };

    const handleSuccess = () => {
        setView('list');
        setEditingTipo(null);
        fetchTipos();
    };

    const handleCancel = () => {
        setView('list');
        setEditingTipo(null);
    };

    if (loading && view === 'list' && tipos.length === 0) {
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
                            {view === 'list' ? 'Gestión de Tipos de Equipo' : view === 'create' ? 'Nuevo Tipo de Equipo' : 'Editar Tipo de Equipo'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {view === 'list' ? 'Administra las categorías de equipos (Laptop, Celular, etc.).' : 'Completa la información del tipo de equipo.'}
                        </p>
                    </div>
                </div>

                {view === 'list' && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Tipo
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <TiposEquipoTable
                    tipos={tipos}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <TipoEquipoForm
                        initialData={editingTipo}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

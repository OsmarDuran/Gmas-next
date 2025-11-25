"use client";

import { useState, useEffect } from "react";
import { Marca } from "@prisma/client";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { MarcasTable } from "@/app/components/catalogos/MarcasTable";
import { MarcaForm } from "@/app/components/catalogos/MarcaForm";
import Link from "next/link";

export default function MarcasPage() {
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingMarca, setEditingMarca] = useState<Marca | null>(null);

    const fetchMarcas = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/marcas");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMarcas(data);
            }
        } catch (error) {
            console.error("Error fetching marcas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarcas();
    }, []);

    const handleCreate = () => {
        setEditingMarca(null);
        setView('create');
    };

    const handleEdit = (marca: Marca) => {
        setEditingMarca(marca);
        setView('edit');
    };

    const handleDelete = async (marca: Marca) => {
        if (!confirm(`¿Estás seguro de eliminar la marca "${marca.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/marcas/${marca.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchMarcas();
            }
        } catch (error) {
            console.error("Error deleting marca:", error);
        }
    };

    const handleSuccess = () => {
        setView('list');
        setEditingMarca(null);
        fetchMarcas();
    };

    const handleCancel = () => {
        setView('list');
        setEditingMarca(null);
    };

    if (loading && view === 'list' && marcas.length === 0) {
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
                            {view === 'list' ? 'Gestión de Marcas' : view === 'create' ? 'Nueva Marca' : 'Editar Marca'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {view === 'list' ? 'Administra las marcas de equipos y sus logos.' : 'Completa la información de la marca.'}
                        </p>
                    </div>
                </div>

                {view === 'list' && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Marca
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <MarcasTable
                    marcas={marcas}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <MarcaForm
                        initialData={editingMarca}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { TipoEquipo } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface TipoEquipoFormProps {
    initialData?: TipoEquipo | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function TipoEquipoForm({ initialData, onSuccess, onCancel }: TipoEquipoFormProps) {
    const [nombre, setNombre] = useState(initialData?.nombre || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = initialData
                ? `/api/tipos-equipo/${initialData.id}`
                : "/api/tipos-equipo";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al guardar el tipo de equipo");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Tipo de Equipo *
                </label>
                <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ej. Laptop, Celular, Monitor"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {initialData ? "Guardar Cambios" : "Crear Tipo"}
                </button>
            </div>
        </form>
    );
}

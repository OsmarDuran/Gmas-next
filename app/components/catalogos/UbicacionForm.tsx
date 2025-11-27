"use client";

import { useState, useEffect } from "react";
import { Ubicacion, Estatus } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface UbicacionFormProps {
    initialData?: (Ubicacion & { estatus: Estatus }) | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function UbicacionForm({ initialData, onSuccess, onCancel }: UbicacionFormProps) {
    const [nombre, setNombre] = useState(initialData?.nombre || "");
    const [estatusId, setEstatusId] = useState<number | "">(initialData?.estatusId || "");
    const [notas, setNotas] = useState(initialData?.notas || "");

    const [estatusOptions, setEstatusOptions] = useState<Estatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const res = await fetch("/api/estatus?tipo=UBICACION");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setEstatusOptions(data);
                    // Si es nuevo y no hay estatus seleccionado, preseleccionar "Activo"
                    if (!initialData && data.length > 0) {
                        const activo = data.find(e => e.nombre === "Activo");
                        if (activo) setEstatusId(activo.id);
                    }
                }
            } catch (err) {
                console.error("Error loading catalogs", err);
                setError("Error al cargar estatus");
            } finally {
                setLoadingCatalogs(false);
            }
        };
        fetchCatalogs();
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = initialData
                ? `/api/ubicaciones/${initialData.id}`
                : "/api/ubicaciones";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    estatusId: Number(estatusId),
                    notas
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al guardar la ubicación");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingCatalogs) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de la Ubicación *
                </label>
                <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ej. Oficina Central, Almacén Norte"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estatus *
                </label>
                <select
                    required
                    value={estatusId}
                    onChange={(e) => setEstatusId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                >
                    <option value="">Seleccionar Estatus</option>
                    {estatusOptions.map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notas (Opcional)
                </label>
                <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
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
                    {initialData ? "Guardar Cambios" : "Crear Ubicación"}
                </button>
            </div>
        </form>
    );
}

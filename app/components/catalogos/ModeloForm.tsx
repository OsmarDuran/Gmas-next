"use client";

import { useState, useEffect } from "react";
import { Modelo, Marca, TipoEquipo } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface ModeloFormProps {
    initialData?: Modelo | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ModeloForm({ initialData, onSuccess, onCancel }: ModeloFormProps) {
    const [nombre, setNombre] = useState(initialData?.nombre || "");
    const [marcaId, setMarcaId] = useState<number | "">(initialData?.marcaId || "");
    const [tipoId, setTipoId] = useState<number | "">(initialData?.tipoId || "");
    const [notas, setNotas] = useState(initialData?.notas || "");

    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [tipos, setTipos] = useState<TipoEquipo[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [resMarcas, resTipos] = await Promise.all([
                    fetch("/api/marcas"),
                    fetch("/api/tipos-equipo")
                ]);
                const dataMarcas = await resMarcas.json();
                const dataTipos = await resTipos.json();

                if (Array.isArray(dataMarcas)) setMarcas(dataMarcas);
                if (Array.isArray(dataTipos)) setTipos(dataTipos);
            } catch (err) {
                console.error("Error loading catalogs", err);
                setError("Error al cargar catálogos");
            } finally {
                setLoadingCatalogs(false);
            }
        };
        fetchCatalogs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const url = initialData
                ? `/api/modelos/${initialData.id}`
                : "/api/modelos";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    marcaId: Number(marcaId),
                    tipoId: Number(tipoId),
                    notas
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al guardar el modelo");
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Marca *
                    </label>
                    <select
                        required
                        value={marcaId}
                        onChange={(e) => setMarcaId(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    >
                        <option value="">Seleccionar Marca</option>
                        {marcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Equipo *
                    </label>
                    <select
                        required
                        value={tipoId}
                        onChange={(e) => setTipoId(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    >
                        <option value="">Seleccionar Tipo</option>
                        {tipos.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Modelo *
                </label>
                <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ej. Latitude 5420"
                />
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
                    {initialData ? "Guardar Cambios" : "Crear Modelo"}
                </button>
            </div>
        </form>
    );
}

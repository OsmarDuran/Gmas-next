"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Tipo { id: number; nombre: string; }
interface Marca { id: number; nombre: string; }
interface Modelo { id: number; nombre: string; marcaId: number; }
interface Ubicacion { id: number; nombre: string; }
interface Estatus { id: number; nombre: string; }

export function EquiposFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tipos, setTipos] = useState<Tipo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [estatuses, setEstatuses] = useState<Estatus[]>([]);

    const selectedMarcaId = searchParams.get("marcaId");
    const filteredModelos = selectedMarcaId
        ? modelos.filter(m => m.marcaId === Number(selectedMarcaId))
        : [];

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [tiposRes, marcasRes, modelosRes, ubicacionesRes, estatusRes] = await Promise.all([
                    fetch("/api/tipos-equipo"),
                    fetch("/api/marcas"),
                    fetch("/api/modelos"),
                    fetch("/api/ubicaciones"),
                    fetch("/api/estatus?tipo=EQUIPO")
                ]);

                if (tiposRes.ok) setTipos(await tiposRes.json());
                if (marcasRes.ok) setMarcas(await marcasRes.json());
                if (modelosRes.ok) setModelos(await modelosRes.json());
                if (ubicacionesRes.ok) setUbicaciones(await ubicacionesRes.json());
                if (estatusRes.ok) setEstatuses(await estatusRes.json());
            } catch (error) {
                console.error("Error loading catalogs:", error);
            }
        };
        fetchCatalogs();
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset modelo if marca changes
        if (key === "marcaId") {
            params.delete("modeloId");
        }

        params.set("page", "1");
        router.push(`/equipos/todos?${params.toString()}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
            {/* Tipo */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
                <select
                    className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchParams.get("tipoId") || ""}
                    onChange={(e) => handleFilterChange("tipoId", e.target.value)}
                >
                    <option value="">Todos</option>
                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>

            {/* Marca */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Marca</label>
                <select
                    className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchParams.get("marcaId") || ""}
                    onChange={(e) => handleFilterChange("marcaId", e.target.value)}
                >
                    <option value="">Todas</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
            </div>

            {/* Modelo */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Modelo</label>
                <select
                    className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={searchParams.get("modeloId") || ""}
                    onChange={(e) => handleFilterChange("modeloId", e.target.value)}
                    disabled={!selectedMarcaId}
                >
                    <option value="">{selectedMarcaId ? "Todos" : "Selecciona una marca"}</option>
                    {filteredModelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
            </div>

            {/* Ubicacion */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ubicación</label>
                <select
                    className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchParams.get("ubicacionId") || ""}
                    onChange={(e) => handleFilterChange("ubicacionId", e.target.value)}
                >
                    <option value="">Todas</option>
                    {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
            </div>

            {/* Estatus */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estatus</label>
                <select
                    className="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-zinc-950 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchParams.get("estatusId") || ""}
                    onChange={(e) => handleFilterChange("estatusId", e.target.value)}
                >
                    <option value="">Todos</option>
                    {estatuses.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
            </div>

            {/* Search - Full width on mobile, auto on desktop */}
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5 mt-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por serie, nota, IMEI, teléfono..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                        defaultValue={searchParams.get("search") || ""}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleFilterChange("search", e.currentTarget.value);
                            }
                        }}
                        onBlur={(e) => handleFilterChange("search", e.target.value)}
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

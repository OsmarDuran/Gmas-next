"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Tipo { id: number; nombre: string; }
interface Marca { id: number; nombre: string; }
interface Modelo { id: number; nombre: string; marcaId: number; tipoId: number; }
interface Ubicacion { id: number; nombre: string; }
interface Estatus { id: number; nombre: string; }

interface EquiposFiltersProps {
    excludeFilters?: ('tipo' | 'marca' | 'modelo' | 'ubicacion' | 'estatus')[];
}

export function EquiposFilters({ excludeFilters = [] }: EquiposFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tipos, setTipos] = useState<Tipo[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [estatuses, setEstatuses] = useState<Estatus[]>([]);

    const selectedMarcaId = searchParams.get("marcaId");
    const selectedTipoId = searchParams.get("tipoId");

    const filteredModelos = selectedMarcaId
        ? modelos.filter(m => {
            const matchMarca = m.marcaId === Number(selectedMarcaId);
            const matchTipo = selectedTipoId ? m.tipoId === Number(selectedTipoId) : true;
            return matchMarca && matchTipo;
        })
        : [];

    // Create a stable key for the dependency array to prevent infinite loops
    // because excludeFilters defaults to [] which is a new reference on every render
    const excludeFiltersKey = excludeFilters.join(',');

    useEffect(() => {
        const fetchCatalogs = async () => {
            const fetcher = (url: string, setter: (data: any[]) => void) =>
                fetch(url)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
                        return res.json();
                    })
                    .then(setter)
                    .catch(err => console.error(`Error fetching ${url}:`, err));

            const promises = [];
            if (!excludeFilters.includes('tipo')) promises.push(fetcher("/api/tipos-equipo", setTipos));
            if (!excludeFilters.includes('marca')) promises.push(fetcher("/api/marcas", setMarcas));
            if (!excludeFilters.includes('modelo')) promises.push(fetcher("/api/modelos", setModelos));
            if (!excludeFilters.includes('ubicacion')) promises.push(fetcher("/api/ubicaciones", setUbicaciones));
            if (!excludeFilters.includes('estatus')) promises.push(fetcher("/api/estatus?tipo=EQUIPO", setEstatuses));

            await Promise.all(promises);
        };
        fetchCatalogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excludeFiltersKey]);

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

        // Construct the new path preserving the current pathname
        const pathname = window.location.pathname;
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-8 p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Tipo */}
                {!excludeFilters.includes('tipo') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                                value={searchParams.get("tipoId") || ""}
                                onChange={(e) => handleFilterChange("tipoId", e.target.value)}
                            >
                                <option value="">Todos los tipos</option>
                                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Marca */}
                {!excludeFilters.includes('marca') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marca</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                                value={searchParams.get("marcaId") || ""}
                                onChange={(e) => handleFilterChange("marcaId", e.target.value)}
                            >
                                <option value="">Todas las marcas</option>
                                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modelo */}
                {!excludeFilters.includes('modelo') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modelo</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                value={searchParams.get("modeloId") || ""}
                                onChange={(e) => handleFilterChange("modeloId", e.target.value)}
                                disabled={!selectedMarcaId}
                            >
                                <option value="">{selectedMarcaId ? "Todos los modelos" : "Selecciona marca"}</option>
                                {filteredModelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ubicacion */}
                {!excludeFilters.includes('ubicacion') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                                value={searchParams.get("ubicacionId") || ""}
                                onChange={(e) => handleFilterChange("ubicacionId", e.target.value)}
                            >
                                <option value="">Todas las ubicaciones</option>
                                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estatus */}
                {!excludeFilters.includes('estatus') && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estatus</label>
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                                value={searchParams.get("estatusId") || ""}
                                onChange={(e) => handleFilterChange("estatusId", e.target.value)}
                            >
                                <option value="">Todos los estatus</option>
                                {estatuses.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="mt-6">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Buscar por número de serie, nota, IMEI, teléfono..."
                        className="w-full pl-12 pr-4 py-3 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-hover:border-blue-400/50 dark:text-white"
                        defaultValue={searchParams.get("search") || ""}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleFilterChange("search", e.currentTarget.value);
                            }
                        }}
                        onBlur={(e) => handleFilterChange("search", e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
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
        </div>
    );
}

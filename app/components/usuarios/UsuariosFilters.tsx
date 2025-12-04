"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Rol { id: number; nombre: string; }
interface Centro { id: number; nombre: string; }

export function UsuariosFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [roles, setRoles] = useState<Rol[]>([]);
    const [centros, setCentros] = useState<Centro[]>([]);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [rolesRes, centrosRes] = await Promise.all([
                    fetch("/api/roles"),
                    fetch("/api/centros")
                ]);

                if (rolesRes.ok) setRoles(await rolesRes.json());
                if (centrosRes.ok) setCentros(await centrosRes.json());
            } catch (error) {
                console.error("Error fetching catalogs:", error);
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

        params.set("page", "1");

        const pathname = window.location.pathname;
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-8 p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-zinc-800 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rol */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</label>
                    <div className="relative">
                        <select
                            className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                            value={searchParams.get("rolId") || ""}
                            onChange={(e) => handleFilterChange("rolId", e.target.value)}
                        >
                            <option value="">Todos los roles</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                {/* Centro */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Centro</label>
                    <div className="relative">
                        <select
                            className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                            value={searchParams.get("centroId") || ""}
                            onChange={(e) => handleFilterChange("centroId", e.target.value)}
                        >
                            <option value="">Todos los centros</option>
                            {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                {/* Estatus */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estatus</label>
                    <div className="relative">
                        <select
                            className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-blue-400/50"
                            value={searchParams.get("activo") || ""}
                            onChange={(e) => handleFilterChange("activo", e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email..."
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
                        <Search className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

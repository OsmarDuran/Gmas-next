"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TipoEquipo, Marca, Ubicacion, Estatus, Color, Modelo } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface MarcaWithTipos extends Marca {
    tipos: { tipoId: number }[];
}

interface EquipoFormProps {
    tipos: TipoEquipo[];
    marcas: MarcaWithTipos[];
    ubicaciones: Ubicacion[];
    estatus: Estatus[];
    colores: Color[];
    equipo?: any; // Equipo a editar (opcional)
}

export function EquipoForm({ tipos, marcas, ubicaciones, estatus, colores, equipo }: EquipoFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Estados del formulario (inicializados con equipo si existe)
    const [tipoId, setTipoId] = useState<number | "">(equipo?.tipoId || "");
    const [marcaId, setMarcaId] = useState<number | "">(equipo?.modelo?.marcaTipo?.marcaId || "");
    const [modeloId, setModeloId] = useState<number | "">(equipo?.modeloId || "");
    const [ubicacionId, setUbicacionId] = useState<number | "">(equipo?.ubicacionId || "");
    const [estatusId, setEstatusId] = useState<number | "">(equipo?.estatusId || "");
    const [numeroSerie, setNumeroSerie] = useState(equipo?.numeroSerie || "");
    const [notas, setNotas] = useState(equipo?.notas || "");

    // Estados dinámicos
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [loadingModelos, setLoadingModelos] = useState(false);

    // Estados específicos
    const [numeroAsignado, setNumeroAsignado] = useState(equipo?.sim?.numeroAsignado || "");
    const [imei, setImei] = useState(equipo?.sim?.imei || "");
    const [colorId, setColorId] = useState<number | "">(equipo?.consumible?.colorId || "");

    // Lógica de tipos
    const selectedTipo = tipos.find(t => t.id === Number(tipoId));
    const isSim = selectedTipo?.nombre.toLowerCase().includes("sim");
    const isConsumible = selectedTipo?.nombre.toLowerCase().includes("consumible") || selectedTipo?.nombre.toLowerCase().includes("toner");

    // Filtrar marcas según tipo seleccionado
    const marcasFiltradas = tipoId
        ? marcas.filter(m => m.tipos.some(t => t.tipoId === Number(tipoId)))
        : [];

    // Cargar modelos cuando cambian tipo y marca
    useEffect(() => {
        if (tipoId && marcaId) {
            setLoadingModelos(true);
            fetch(`/api/modelos?tipoId=${tipoId}&marcaId=${marcaId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setModelos(data);
                    else setModelos([]);
                })
                .catch(() => setModelos([]))
                .finally(() => setLoadingModelos(false));
        } else {
            setModelos([]);
        }
    }, [tipoId, marcaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const payload: any = {
            tipoId: Number(tipoId),
            ubicacionId: Number(ubicacionId),
            estatusId: Number(estatusId),
            numeroSerie,
            notas,
        };

        if (modeloId) payload.modeloId = Number(modeloId);

        if (isSim) {
            payload.simData = { numeroAsignado, imei };
        }

        if (isConsumible) {
            payload.consumibleData = { colorId: Number(colorId) };
        }

        try {
            const url = equipo ? `/api/equipos/${equipo.id}` : "/api/equipos";
            const method = equipo ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al guardar equipo");
            }

            router.push("/equipos");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de Equipo</label>
                    <select
                        value={tipoId}
                        onChange={e => {
                            setTipoId(Number(e.target.value));
                            setMarcaId("");
                            setModeloId("");
                        }}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                </div>

                {/* Estatus */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Estatus</label>
                    <select
                        value={estatusId}
                        onChange={e => setEstatusId(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {estatus.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>

                {/* Marca */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Marca</label>
                    <select
                        value={marcaId}
                        onChange={e => setMarcaId(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        disabled={!tipoId}
                    >
                        <option value="">Seleccionar...</option>
                        {marcasFiltradas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                </div>

                {/* Modelo */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Modelo</label>
                    <select
                        value={modeloId}
                        onChange={e => setModeloId(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        disabled={!marcaId || loadingModelos}
                        required
                    >
                        <option value="">{loadingModelos ? "Cargando..." : "Seleccionar..."}</option>
                        {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                    <div className="mt-1 text-right">
                        <a href="/catalogos/modelos" target="_blank" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            + Crear nuevo modelo
                        </a>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ubicación</label>
                    <select
                        value={ubicacionId}
                        onChange={e => setUbicacionId(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                </div>

                {/* Campos Específicos SIM */}
                {isSim && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Número Asignado</label>
                            <input
                                type="text"
                                value={numeroAsignado}
                                onChange={e => setNumeroAsignado(e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">IMEI</label>
                            <input
                                type="text"
                                value={imei}
                                onChange={e => setImei(e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                                required
                            />
                        </div>
                    </>
                )}

                {/* Campos Específicos Consumible */}
                {isConsumible && (
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color</label>
                        <select
                            value={colorId}
                            onChange={e => setColorId(Number(e.target.value))}
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {colores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                )}

                {/* Serie y Notas */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Número de Serie / Identificador</label>
                    <input
                        type="text"
                        value={numeroSerie}
                        onChange={e => setNumeroSerie(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Opcional para consumibles, obligatorio para equipos físicos.</p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notas</label>
                    <textarea
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white h-24"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Equipo
                </button>
            </div>
        </form>
    );
}

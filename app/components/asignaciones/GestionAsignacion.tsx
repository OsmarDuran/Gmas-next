"use client";

import { useState, useEffect } from "react";
import { Usuario, Puesto, Centro, Equipo, TipoEquipo, Modelo, Marca, EquipoSim, EquipoConsumible, Color } from "@prisma/client";
import { Search, ArrowRight, ArrowLeft, Save, Loader2, FileText, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipos complejos
type EquipoCompleto = Equipo & {
    tipo: TipoEquipo;
    modelo: (Modelo & {
        marcaTipo: {
            marca: Marca;
        }
    }) | null;
    sim: EquipoSim | null;
    consumible: (EquipoConsumible & { color: Color }) | null;
};

type UsuarioCompleto = Usuario & {
    puesto: Puesto;
    centro: Centro;
};

interface GestionAsignacionProps {
    usuario: UsuarioCompleto;
    equiposAsignadosIniciales: EquipoCompleto[];
    estatusDisponibleId: number;
    currentUserId: number; // ID del usuario logueado (simulado)
}

export function GestionAsignacion({ usuario, equiposAsignadosIniciales, estatusDisponibleId, currentUserId }: GestionAsignacionProps) {
    const router = useRouter();

    // Estado
    const [asignados, setAsignados] = useState<EquipoCompleto[]>(equiposAsignadosIniciales);
    const [disponibles, setDisponibles] = useState<EquipoCompleto[]>([]);
    const [desasignadosLocalmente, setDesasignadosLocalmente] = useState<EquipoCompleto[]>([]); // Nuevo estado para persistir equipos liberados
    const [search, setSearch] = useState("");
    const [loadingDisponibles, setLoadingDisponibles] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [error, setError] = useState("");

    // Cargar disponibles
    useEffect(() => {
        const fetchDisponibles = async () => {
            setLoadingDisponibles(true);
            try {
                const params = new URLSearchParams();
                params.set("estatusId", estatusDisponibleId.toString());
                if (search) params.set("search", search);
                params.set("limit", "50"); // Límite razonable

                const res = await fetch(`/api/equipos?${params.toString()}`);
                const data = await res.json();

                if (data.data) {
                    const asignadosIds = new Set(asignados.map(e => e.id));

                    // Combinar remotos con desasignados localmente
                    let pool = [...data.data, ...desasignadosLocalmente];

                    // Eliminar duplicados
                    const seen = new Set();
                    pool = pool.filter(e => {
                        const duplicate = seen.has(e.id);
                        seen.add(e.id);
                        return !duplicate;
                    });

                    // Filtrar los que ya están asignados
                    let filtrados = pool.filter(e => !asignadosIds.has(e.id));

                    // Filtrar por búsqueda localmente también (para los desasignadosLocalmente que no vengan del server filtrados)
                    if (search) {
                        const searchLower = search.toLowerCase();
                        filtrados = filtrados.filter(e => {
                            const texto = `${e.tipo.nombre} ${e.modelo?.nombre || ''} ${e.modelo?.marcaTipo.marca.nombre || ''} ${e.numeroSerie || ''} ${e.sim?.numeroAsignado || ''}`.toLowerCase();
                            return texto.includes(searchLower);
                        });
                    }

                    setDisponibles(filtrados);
                }
            } catch (err) {
                console.error("Error cargando disponibles", err);
            } finally {
                setLoadingDisponibles(false);
            }
        };

        const timeoutId = setTimeout(fetchDisponibles, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [search, estatusDisponibleId, asignados, desasignadosLocalmente]);

    // Acciones
    const asignarEquipo = (equipo: EquipoCompleto) => {
        setAsignados([...asignados, equipo]);
        setDesasignadosLocalmente(desasignadosLocalmente.filter(e => e.id !== equipo.id));
    };

    const desasignarEquipo = (equipo: EquipoCompleto) => {
        setAsignados(asignados.filter(e => e.id !== equipo.id));
        setDesasignadosLocalmente([...desasignadosLocalmente, equipo]);
    };

    const guardarCambios = async () => {
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/asignaciones/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    equiposIds: asignados.map(e => e.id),
                    asignadoPor: currentUserId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al guardar asignaciones");
            }

            setSuccess(true);
            setPdfUrl(data.pdfUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Render Item Helper
    const renderEquipoItem = (equipo: EquipoCompleto, action: 'add' | 'remove') => (
        <div key={equipo.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg mb-2 shadow-sm">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{equipo.tipo.nombre}</span>
                    <span className="text-xs text-gray-500">#{equipo.id}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    {equipo.modelo ? `${equipo.modelo.marcaTipo.marca.nombre} ${equipo.modelo.nombre}` : 'Genérico'}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                    {equipo.sim ? `Tel: ${equipo.sim.numeroAsignado}` : equipo.numeroSerie || 'S/N'}
                </div>
            </div>
            <button
                onClick={() => action === 'add' ? asignarEquipo(equipo) : desasignarEquipo(equipo)}
                className={`p-2 rounded-full transition-colors ${action === 'add'
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                    }`}
            >
                {action === 'add' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    );

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Asignación Guardada!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    Los cambios se han registrado correctamente y se ha generado el acta de resguardo actualizada.
                </p>

                <div className="flex gap-4">
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <FileText className="w-5 h-5" />
                        Descargar Acta PDF
                    </a>
                    <button
                        onClick={() => router.push('/asignaciones/usuarios')}
                        className="px-6 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Volver al Listado
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Usuario */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {usuario.puesto.nombre} • {usuario.centro.nombre}
                    </p>
                </div>
                <button
                    onClick={guardarCambios}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                {/* Columna Izquierda: Asignados */}
                <div className="flex flex-col bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-between">
                        Equipos Asignados
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{asignados.length}</span>
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {asignados.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                No hay equipos asignados
                            </div>
                        ) : (
                            asignados.map(e => renderEquipoItem(e, 'remove'))
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Disponibles */}
                <div className="flex flex-col bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Equipos Disponibles
                    </h3>

                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Buscar equipo disponible..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {loadingDisponibles ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : disponibles.length === 0 ? (
                            <div className="text-center text-gray-400 py-10">
                                No se encontraron equipos disponibles
                            </div>
                        ) : (
                            disponibles.map(e => renderEquipoItem(e, 'add'))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Loader2, Search, Filter, Eye, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BitacoraItem {
    id: number;
    accion: string;
    seccion: string;
    elementoId: number | null;
    detalles: any;
    fecha: string;
    autor: {
        nombre: string;
        apellidoPaterno: string | null;
        email: string;
    };
    equipoExtra?: {
        tipo: string;
        marca: string;
        modelo: string;
    };
    rutaPdf?: string | null;
}

export default function BitacoraPage() {
    const [bitacoras, setBitacoras] = useState<BitacoraItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filtros
    const [seccion, setSeccion] = useState("");
    const [accion, setAccion] = useState("");

    // Modal Detalles
    const [selectedItem, setSelectedItem] = useState<BitacoraItem | null>(null);

    const fetchBitacora = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (seccion) params.set("seccion", seccion);
            if (accion) params.set("accion", accion);

            const res = await fetch(`/api/bitacora?${params.toString()}`);
            const data = await res.json();

            if (data.data) {
                setBitacoras(data.data);
                setTotalPages(data.meta.totalPages);
            }
        } catch (error) {
            console.error("Error cargando bitácora", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBitacora();
    }, [page, seccion, accion]);

    const getAccionColor = (accion: string) => {
        switch (accion) {
            case "CREAR": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "ELIMINAR": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "MODIFICAR": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "ASIGNAR": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "DEVOLVER": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bitácora de Movimientos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Registro de auditoría de acciones en el sistema</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={seccion}
                        onChange={(e) => { setSeccion(e.target.value); setPage(1); }}
                        className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm p-2.5"
                    >
                        <option value="">Todas las Secciones</option>
                        <option value="EQUIPOS">Equipos</option>
                        <option value="USUARIOS">Usuarios</option>
                        <option value="ASIGNACIONES">Asignaciones</option>
                        <option value="MARCAS">Marcas</option>
                        <option value="MODELOS">Modelos</option>
                    </select>

                    <select
                        value={accion}
                        onChange={(e) => { setAccion(e.target.value); setPage(1); }}
                        className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm p-2.5"
                    >
                        <option value="">Todas las Acciones</option>
                        <option value="CREAR">Crear</option>
                        <option value="MODIFICAR">Modificar</option>
                        <option value="ELIMINAR">Eliminar</option>
                        <option value="ASIGNAR">Asignar</option>
                        <option value="DEVOLVER">Devolver</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-950 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Autor</th>
                                <th className="px-6 py-3">Sección</th>
                                <th className="px-6 py-3">Acción</th>
                                <th className="px-6 py-3">Elemento ID</th>
                                <th className="px-6 py-3 text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                                    </td>
                                </tr>
                            ) : bitacoras.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            ) : (
                                bitacoras.map((item) => (
                                    <tr key={item.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(item.fecha), "dd MMM yyyy HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {item.autor.nombre} {item.autor.apellidoPaterno}
                                            </div>
                                            <div className="text-xs text-gray-500">{item.autor.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                                                {item.seccion}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getAccionColor(item.accion)}`}>
                                                {item.accion}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-gray-900 dark:text-white">
                                                {item.elementoId ? `#${item.elementoId}` : '-'}
                                            </div>
                                            {item.equipoExtra && (
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                                    <span className="font-semibold">{item.equipoExtra.tipo}</span>
                                                    <br />
                                                    {item.equipoExtra.marca} {item.equipoExtra.modelo}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {item.rutaPdf && (
                                                    <a
                                                        href={item.rutaPdf}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm inline-flex items-center gap-1"
                                                        title="Descargar Acta"
                                                    >
                                                        <FileText className="w-4 h-4" /> PDF
                                                    </a>
                                                )}
                                                {item.detalles && (
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm inline-flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" /> Ver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-700"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Página {page} de {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-700"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Modal Detalles */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Detalles del Movimiento #{selectedItem.id}
                            </h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            {selectedItem.accion === 'MODIFICAR' && selectedItem.detalles?.cambios ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cambios Realizados:</h4>
                                    <div className="bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 dark:bg-zinc-900 text-xs uppercase text-gray-500 dark:text-gray-400">
                                                <tr>
                                                    <th className="px-4 py-2">Campo</th>
                                                    <th className="px-4 py-2">Anterior</th>
                                                    <th className="px-4 py-2">Nuevo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                                {Object.entries(selectedItem.detalles.cambios).map(([key, value]) => {
                                                    // Verificar si es estructura nueva { anterior, nuevo }
                                                    const isComparison = typeof value === 'object' && value !== null && 'anterior' in value && 'nuevo' in value;

                                                    const anterior = isComparison ? (value as any).anterior : '-';
                                                    const nuevo = isComparison ? (value as any).nuevo : value;

                                                    // Formatear valores booleanos o nulos
                                                    const formatValue = (val: any) => {
                                                        if (val === null || val === undefined) return <span className="text-gray-400 italic">Nulo</span>;
                                                        if (typeof val === 'boolean') return val ? 'Sí' : 'No';
                                                        if (typeof val === 'object') return JSON.stringify(val);
                                                        return String(val);
                                                    };

                                                    return (
                                                        <tr key={key}>
                                                            <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">{key}</td>
                                                            <td className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10">
                                                                {formatValue(anterior)}
                                                            </td>
                                                            <td className="px-4 py-2 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10">
                                                                {formatValue(nuevo)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Mostrar resto de detalles si existen */}
                                    {Object.keys(selectedItem.detalles).filter(k => k !== 'cambios').length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Otros Detalles:</h4>
                                            <pre className="bg-gray-50 dark:bg-zinc-950 p-3 rounded-lg text-xs overflow-x-auto">
                                                {JSON.stringify(
                                                    Object.fromEntries(Object.entries(selectedItem.detalles).filter(([k]) => k !== 'cambios')),
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg font-mono text-xs text-gray-800 dark:text-gray-300 overflow-x-auto">
                                    <pre>{JSON.stringify(selectedItem.detalles, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

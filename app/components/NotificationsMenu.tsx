"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Loader2, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationItem {
    id: number;
    accion: string;
    seccion: string;
    elementoId: number | null;
    fecha: string;
    autor: {
        nombre: string;
        apellidoPaterno: string | null;
    };
}

export function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/bitacora?limit=5");
            const data = await res.json();
            if (data.data) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Actualizar cada minuto
        return () => clearInterval(interval);
    }, []);

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getActionColor = (accion: string) => {
        switch (accion) {
            case "CREAR": return "text-green-600 dark:text-green-400";
            case "ELIMINAR": return "text-red-600 dark:text-red-400";
            case "MODIFICAR": return "text-yellow-600 dark:text-yellow-400";
            case "ASIGNAR": return "text-blue-600 dark:text-blue-400";
            case "DEVOLVER": return "text-purple-600 dark:text-purple-400";
            default: return "text-gray-600 dark:text-gray-400";
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:text-gray-400 dark:hover:bg-zinc-800 transition-colors"
            >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
                        <button
                            onClick={fetchNotifications}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            disabled={loading}
                        >
                            Actualizar
                        </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No hay actividad reciente
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 ${getActionColor(notif.accion)}`}>
                                                <Info className="w-3 h-3" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                                    {notif.autor.nombre} {notif.autor.apellidoPaterno}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    <span className={getActionColor(notif.accion)}>{notif.accion}</span> en {notif.seccion}
                                                    {notif.elementoId && ` #${notif.elementoId}`}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {format(new Date(notif.fecha), "dd MMM HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-center">
                        <a href="/bitacora" className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400">
                            Ver historial completo
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

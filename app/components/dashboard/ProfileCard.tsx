'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { MoreHorizontal, Clock, Activity } from 'lucide-react';

interface ActivityLog {
    id: number;
    accion: string;
    seccion: string;
    fecha: string;
    detalles: any;
}

export function ProfileCard() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetch(`/api/user/activity?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setActivities(data);
                    }
                })
                .catch(err => console.error("Failed to fetch activity", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 h-full flex flex-col">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-full flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-[var(--color-brand-dark)] dark:text-white">Perfil</h3>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-brand-cyan)] to-[var(--color-brand-dark-blue)] p-1">
                        <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-3xl font-bold text-[var(--color-brand-cyan)]">
                            {user.nombre.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                <h4 className="text-xl font-bold text-[var(--color-brand-dark)] dark:text-white mb-1">{user.nombre}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">@{user.email.split('@')[0]}</p>

                <div className="flex w-full justify-around border-t border-gray-100 dark:border-zinc-800 pt-6">
                    <div>
                        <p className="text-2xl font-bold text-[var(--color-brand-dark)] dark:text-white capitalize">{user.rol}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Rol</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--color-brand-dark)] dark:text-white">Activo</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Estatus</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 mt-4">
                <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                    Actividad Reciente
                </h5>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-xs text-gray-400 text-center">Cargando actividad...</p>
                    ) : activities.length > 0 ? (
                        activities.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start">
                                <div className="mt-1 min-w-[8px] h-2 rounded-full bg-[var(--color-brand-cyan)]/30" />
                                <div>
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                        {log.accion} en {log.seccion}
                                    </p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.fecha).toLocaleDateString()} {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center">Sin actividad reciente</p>
                    )}
                </div>
            </div>
        </div>
    );
}

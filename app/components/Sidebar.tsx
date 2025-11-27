'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Users, FileText, Settings, Package, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthProvider';

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    console.log("Sidebar render. User:", user);

    const allMenuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'master'] },
        { name: 'Mis Equipos', href: '/mis-equipos', icon: Monitor, roles: ['employee'] },
        { name: 'Equipos', href: '/equipos', icon: Monitor, roles: ['admin', 'master'] },
        { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['admin', 'master'] },
        { name: 'Asignaciones', href: '/asignaciones', icon: FileText, roles: ['admin', 'master'] },
        { name: 'Catálogos', href: '/catalogos', icon: Package, roles: ['admin', 'master'] },
    ];

    const filteredMenu = allMenuItems.filter(item =>
        user && item.roles.includes(user.rol)
    );

    if (!user) return null; // O un skeleton

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">GMAS 2.0</h1>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.nombre}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user.rol}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {filteredMenu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="border-t border-gray-200 p-4 dark:border-zinc-800 space-y-2">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800">
                    <Settings className="h-5 w-5" />
                    Configuración
                </button>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

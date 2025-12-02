'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Users, FileText, Settings, Package, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthProvider';

import Image from 'next/image';
import { useState } from 'react';
import SplashScreen from './SplashScreen';

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showSplash, setShowSplash] = useState(false);
    const [splashMessage, setSplashMessage] = useState("Cerrando sesión...");
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
        <>
            {showSplash && <SplashScreen message={splashMessage} />}
            <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex h-20 items-center justify-center border-b border-gray-100 dark:border-zinc-800">
                    <div className="relative w-32 h-12">
                        <Image
                            src="/logo.png"
                            alt="Grupo MAS"
                            fill
                            className="object-contain"
                            priority
                        />
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
                                                ? 'bg-[var(--color-brand-cyan)] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-cyan)] dark:text-gray-300 dark:hover:bg-zinc-800'
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
                        onClick={() => {
                            setShowSplash(true);
                            setTimeout(() => {
                                logout();
                            }, 2000);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
}

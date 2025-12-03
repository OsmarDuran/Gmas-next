'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Users, FileText, Settings, Package, LogOut, User, ClipboardList } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(true);

    console.log("Sidebar render. User:", user);

    const allMenuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'master'] },
        { name: 'Mis Equipos', href: '/mis-equipos', icon: Monitor, roles: ['employee'] },
        { name: 'Equipos', href: '/equipos', icon: Monitor, roles: ['admin', 'master'] },
        { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['admin', 'master'] },
        { name: 'Asignaciones', href: '/asignaciones', icon: FileText, roles: ['admin', 'master'] },
        { name: 'Catálogos', href: '/catalogos', icon: Package, roles: ['admin', 'master'] },
        { name: 'Bitácora', href: '/bitacora', icon: ClipboardList, roles: ['admin', 'master'] },
    ];

    const filteredMenu = allMenuItems.filter(item =>
        user && item.roles.includes(user.rol)
    );

    if (!user) return null; // O un skeleton

    return (
        <>
            {showSplash && <SplashScreen message={splashMessage} />}
            <div
                className={clsx(
                    "flex h-full flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-300 ease-in-out z-50",
                    isCollapsed ? "w-20" : "w-64"
                )}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                <div className={clsx(
                    "flex h-16 items-center border-b border-gray-100 dark:border-zinc-800 transition-all duration-300 ease-in-out",
                    isCollapsed ? "justify-center px-0" : "justify-start px-6"
                )}>
                    <div className={clsx("relative transition-all duration-300 ease-in-out", isCollapsed ? "w-10 h-10" : "w-32 h-12")}>
                        <Image
                            src="/logo.png"
                            alt="Grupo MAS"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
                    <ul className="space-y-1 px-2">
                        {filteredMenu.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={clsx(
                                            'flex items-center rounded-md py-2 text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap',
                                            isActive
                                                ? 'bg-[var(--color-brand-cyan)] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-cyan)] dark:text-gray-300 dark:hover:bg-zinc-800',
                                            isCollapsed ? 'pl-[1.1rem] gap-0' : 'px-3 gap-3'
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <item.icon className="h-5 w-5 min-w-[1.25rem]" />
                                        <span className={clsx(
                                            "transition-all duration-300 ease-in-out overflow-hidden",
                                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                                        )}>
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="border-t border-gray-200 p-4 dark:border-zinc-800 space-y-2 overflow-x-hidden">
                    <button className={clsx(
                        "flex w-full items-center rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 whitespace-nowrap transition-all duration-300 ease-in-out",
                        isCollapsed ? "pl-[1.1rem] gap-0" : "px-3 gap-3"
                    )}
                        title={isCollapsed ? "Configuración" : undefined}
                    >
                        <Settings className="h-5 w-5 min-w-[1.25rem]" />
                        <span className={clsx(
                            "transition-all duration-300 ease-in-out overflow-hidden",
                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                        )}>
                            Configuración
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setShowSplash(true);
                            setTimeout(() => {
                                logout();
                            }, 2000);
                        }}
                        className={clsx(
                            "flex w-full items-center rounded-md py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 whitespace-nowrap transition-all duration-300 ease-in-out",
                            isCollapsed ? "pl-[1.1rem] gap-0" : "px-3 gap-3"
                        )}
                        title={isCollapsed ? "Cerrar Sesión" : undefined}
                    >
                        <LogOut className="h-5 w-5 min-w-[1.25rem]" />
                        <span className={clsx(
                            "transition-all duration-300 ease-in-out overflow-hidden",
                            isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                        )}>
                            Cerrar Sesión
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}

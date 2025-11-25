'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Users, FileText, Settings, Package } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Equipos', href: '/equipos', icon: Monitor },
    { name: 'Usuarios', href: '/usuarios', icon: Users },
    { name: 'Asignaciones', href: '/asignaciones', icon: FileText },
    { name: 'Catálogos', href: '/catalogos', icon: Package },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">GMAS 2.0</h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
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
            <div className="border-t border-gray-200 p-4 dark:border-zinc-800">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800">
                    <Settings className="h-5 w-5" />
                    Configuración
                </button>
            </div>
        </div>
    );
}

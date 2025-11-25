import Link from "next/link";
import { Monitor, Smartphone, Printer, Plus } from "lucide-react";

export default function EquiposPage() {
    const options = [
        {
            title: "Ver todos los equipos",
            href: "/equipos/todos",
            icon: Monitor,
            color: "bg-blue-500",
            description: "Listado general de todo el inventario."
        },
        {
            title: "Ver SIMs",
            href: "/equipos/sims",
            icon: Smartphone,
            color: "bg-purple-500",
            description: "Gestión de tarjetas SIM y líneas."
        },
        {
            title: "Ver Consumibles",
            href: "/equipos/consumibles",
            icon: Printer,
            color: "bg-yellow-500",
            description: "Toners, tintas y otros consumibles."
        },
        {
            title: "Agregar equipo",
            href: "/equipos/nuevo",
            icon: Plus,
            color: "bg-green-500",
            description: "Dar de alta un nuevo equipo en el sistema."
        }
    ];

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Gestión de Equipos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {options.map((option) => (
                    <Link key={option.href} href={option.href} className="group">
                        <div className="h-full p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-500/50">
                            <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <option.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {option.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {option.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

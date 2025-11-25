import Link from "next/link";
import { Tag, Smartphone, MapPin, Building, Briefcase, Users, Box, Cpu } from "lucide-react";

export default function CatalogosPage() {
    const catalogos = [
        {
            nombre: "Marcas",
            descripcion: "Gestión de marcas y sus logos",
            ruta: "/catalogos/marcas",
            icono: Tag,
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        },
        {
            nombre: "Modelos",
            descripcion: "Modelos de equipos por marca y tipo",
            ruta: "/catalogos/modelos",
            icono: Smartphone,
            color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        },
        {
            nombre: "Ubicaciones",
            descripcion: "Sedes y oficinas principales",
            ruta: "/catalogos/ubicaciones",
            icono: MapPin,
            color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        },
        {
            nombre: "Centros de Costo",
            descripcion: "Centros operativos y administrativos",
            ruta: "/catalogos/centros",
            icono: Building,
            color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        },
        {
            nombre: "Puestos",
            descripcion: "Cargos y roles laborales",
            ruta: "/catalogos/puestos",
            icono: Briefcase,
            color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
        },
        {
            nombre: "Tipos de Equipo",
            descripcion: "Categorías de hardware (Laptop, Móvil...)",
            ruta: "/catalogos/tipos",
            icono: Cpu,
            color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
        },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogos del Sistema</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Administración de datos maestros y configuraciones globales.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogos.map((cat) => (
                    <Link
                        key={cat.nombre}
                        href={cat.ruta}
                        className="group block p-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-500 dark:hover:border-blue-500"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${cat.color}`}>
                                <cat.icono className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {cat.nombre}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {cat.descripcion}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

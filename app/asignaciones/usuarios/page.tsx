import { UsuariosAsignacionTable } from "@/app/components/asignaciones/UsuariosAsignacionTable";
import { Pagination } from "@/app/components/Pagination";
import { Search } from "lucide-react";

async function getUsuarios(searchParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');
    params.set('activo', 'true'); // Solo usuarios activos

    const res = await fetch(`http://localhost:3000/api/usuarios?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar usuarios");
    return res.json();
}

export default async function UsuariosAsignacionPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const { data: usuarios, meta } = await getUsuarios(params);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Seleccionar Usuario para Asignación</h1>

            <div className="mb-6">
                <form className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar empleado..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
            </div>

            <UsuariosAsignacionTable usuarios={usuarios} />

            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                baseUrl="/asignaciones/usuarios"
                searchParams={params}
            />
        </div>
    );
}

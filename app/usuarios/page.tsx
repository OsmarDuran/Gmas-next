import { UsuariosTable } from "@/app/components/usuarios/UsuariosTable";
import { Pagination } from "@/app/components/Pagination";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

async function getUsuarios(searchParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/usuarios?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar usuarios");
    return res.json();
}

export default async function UsuariosPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const { data: usuarios, meta } = await getUsuarios(params);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
                <Link
                    href="/usuarios/nuevo"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </Link>
            </div>

            <div className="mb-6">
                <form className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar por nombre, email..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
            </div>

            <UsuariosTable usuarios={usuarios} />

            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                baseUrl="/usuarios"
                searchParams={params}
            />
        </div>
    );
}

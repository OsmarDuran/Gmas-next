import { EquiposTable } from "@/app/components/equipos/EquiposTable";
import { Pagination } from "@/app/components/Pagination";
import { Search } from "lucide-react";

async function getTipoSimId() {
    try {
        const res = await fetch('http://localhost:3000/api/tipos-equipo', { cache: 'force-cache' }); // Cachear esto es seguro
        if (!res.ok) return 12; // Fallback
        const tipos = await res.json();
        const sim = tipos.find((t: any) => t.nombre.toLowerCase().includes('sim'));
        return sim?.id || 12;
    } catch {
        return 12;
    }
}

async function getSims(searchParams: Record<string, string>, tipoId: number) {
    const params = new URLSearchParams(searchParams);
    params.set('tipoId', tipoId.toString());
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');

    const res = await fetch(`http://localhost:3000/api/equipos?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar SIMs");
    return res.json();
}

export default async function SimsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const tipoId = await getTipoSimId();
    const { data: equipos, meta } = await getSims(params, tipoId);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de SIMs</h1>
            </div>

            <div className="mb-6">
                <form className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar por número, IMEI, notas..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
            </div>

            <EquiposTable equipos={equipos} />

            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                baseUrl="/equipos/sims"
                searchParams={params}
            />
        </div>
    );
}

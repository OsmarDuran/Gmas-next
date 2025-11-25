import { UsuarioForm } from "@/app/components/usuarios/UsuarioForm";
import { prisma } from "@/lib/prisma";

async function getCatalogos() {
    const [roles, puestos, centros, lideres] = await Promise.all([
        prisma.rol.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.puesto.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.centro.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.lider.findMany({ orderBy: { nombre: 'asc' } }),
    ]);

    return { roles, puestos, centros, lideres };
}

export default async function NuevoUsuarioPage() {
    const catalogos = await getCatalogos();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Registrar Nuevo Usuario</h1>
            <UsuarioForm {...catalogos} />
        </div>
    );
}

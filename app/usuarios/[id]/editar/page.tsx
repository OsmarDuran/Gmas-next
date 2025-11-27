import { UsuarioForm } from "@/app/components/usuarios/UsuarioForm";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

async function getCatalogos() {
    const [roles, puestos, centros, lideres] = await Promise.all([
        prisma.rol.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.puesto.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.centro.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.lider.findMany({ orderBy: { nombre: 'asc' } }),
    ]);

    return { roles, puestos, centros, lideres };
}

async function getUsuario(id: number) {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
    });
    return usuario;
}

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/login");
    }

    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (isNaN(id)) notFound();

    const [catalogos, usuario] = await Promise.all([
        getCatalogos(),
        getUsuario(id)
    ]);

    if (!usuario) notFound();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Editar Usuario #{usuario.id}</h1>
            <UsuarioForm
                {...catalogos}
                usuario={usuario}
                currentUserRole={currentUser.rol}
            />
        </div>
    );
}

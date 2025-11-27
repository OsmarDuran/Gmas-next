"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rol, Puesto, Centro, Lider } from "@prisma/client";
import { Loader2, Save } from "lucide-react";

interface UsuarioFormProps {
    roles: Rol[];
    puestos: Puesto[];
    centros: Centro[];
    lideres: Lider[];
    usuario?: any; // Usuario a editar
    currentUserRole?: string; // Rol del usuario actual
}

export function UsuarioForm({ roles, puestos, centros, lideres, usuario, currentUserRole }: UsuarioFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || "",
        apellidoPaterno: usuario?.apellidoPaterno || "",
        apellidoMaterno: usuario?.apellidoMaterno || "",
        email: usuario?.email || "",
        telefono: usuario?.telefono || "",
        rolId: usuario?.rolId || "",
        puestoId: usuario?.puestoId || "",
        centroId: usuario?.centroId || "",
        liderId: usuario?.liderId || "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload: any = {
                ...formData,
                rolId: Number(formData.rolId),
                puestoId: Number(formData.puestoId),
                centroId: Number(formData.centroId),
                liderId: Number(formData.liderId),
            };

            // Si es edición y el password está vacío, no enviarlo
            if (usuario && !payload.password) {
                delete payload.password;
            }

            const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios";
            const method = usuario ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al guardar usuario");
            }

            router.push("/usuarios");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const canEditPassword = !usuario || currentUserRole === 'master';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
                    <input name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Apellido Paterno</label>
                    <input name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Apellido Materno</label>
                    <input name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Teléfono</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>

                {canEditPassword && (
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {usuario ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                            required={!usuario} // Requerido solo al crear
                            placeholder={usuario ? "Dejar en blanco para mantener actual" : ""}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rol</label>
                    <select name="rolId" value={formData.rolId} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required>
                        <option value="">Seleccionar...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Puesto</label>
                    <select name="puestoId" value={formData.puestoId} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required>
                        <option value="">Seleccionar...</option>
                        {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Centro de Costos</label>
                    <select name="centroId" value={formData.centroId} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required>
                        <option value="">Seleccionar...</option>
                        {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Líder</label>
                    <select name="liderId" value={formData.liderId} onChange={handleChange} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" required>
                        <option value="">Seleccionar...</option>
                        {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {usuario ? "Guardar Cambios" : "Crear Usuario"}
                </button>
            </div>
        </form>
    );
}

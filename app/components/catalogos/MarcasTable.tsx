"use client";

import { Marca } from "@prisma/client";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface MarcasTableProps {
    marcas: Marca[];
    onEdit: (marca: Marca) => void;
    onDelete: (marca: Marca) => void;
}

export function MarcasTable({ marcas, onEdit, onDelete }: MarcasTableProps) {
    if (marcas.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">No hay marcas registradas</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-zinc-800 dark:text-gray-300">
                    <tr>
                        <th className="px-6 py-3 w-20">Logo</th>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Notas</th>
                        <th className="px-6 py-3 w-24 text-center">Estado</th>
                        <th className="px-6 py-3 w-32 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {marcas.map((marca) => (
                        <tr key={marca.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <td className="px-6 py-3">
                                <div className="relative w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-zinc-700">
                                    {marca.logoUrl ? (
                                        <Image
                                            src={marca.logoUrl}
                                            alt={marca.nombre}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                                {marca.nombre}
                            </td>
                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                {marca.notas || "-"}
                            </td>
                            <td className="px-6 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${marca.activo
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {marca.activo ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(marca)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(marca)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import WaterBackground from "@/app/components/WaterBackground";

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, apellidoPaterno, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al registrarse");
            }

            // Redirigir a login tras registro exitoso
            router.push("/login");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <WaterBackground variant="sunset" />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-zinc-800/50">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="relative w-24 h-24">
                                <Image
                                    src="/logo.png"
                                    alt="GMAS Logo"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                    priority
                                />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Crear Cuenta</h1>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Únete a GMAS 2.0</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                                    placeholder="Juan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-1">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    value={apellidoPaterno}
                                    onChange={(e) => setApellidoPaterno(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-1">
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                                placeholder="usuario@empresa.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-1">
                                Contraseña *
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50/90 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm border border-red-100 dark:border-red-800/50 text-center font-medium backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-500/30"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6" />}
                            Registrarse
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline transition-colors">
                            Inicia sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

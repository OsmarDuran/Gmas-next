"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import SplashScreen from "@/app/components/SplashScreen";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al iniciar sesión");
            }

            setShowSplash(true);

            // Delay login to show splash screen
            setTimeout(() => {
                login(data.user);
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <>
            {showSplash && <SplashScreen />}
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bienvenido</h1>
                        <p className="text-gray-500 dark:text-gray-400">Inicia sesión en GMAS 2.0</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
                                placeholder="usuario@empresa.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
                                placeholder="••••••••"
                            />
                            <div className="flex justify-end mt-1">
                                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            Iniciar Sesión
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline font-medium">
                            Regístrate aquí
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import WaterBackground from "@/app/components/WaterBackground";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                // Si no es JSON, probablemente sea un error del servidor o un redirect inesperado
                const text = await res.text();
                console.error("Respuesta no JSON:", text);
                throw new Error("Respuesta inesperada del servidor");
            }

            if (res.ok) {
                setMessage({ type: 'success', text: 'Si el correo existe, se ha enviado un enlace de recuperación. (Revisa la consola del servidor para el link de prueba)' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al procesar la solicitud' });
            }
        } catch (error: any) {
            console.error("Error en forgot-password:", error);
            setMessage({ type: 'error', text: error.message || 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <WaterBackground variant="deep" showSunkenShip />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-zinc-800/50">
                    <div className="mb-6">
                        <Link href="/login" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver al inicio de sesión
                        </Link>
                    </div>

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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Recuperar Contraseña</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl text-sm text-center mb-6 font-medium backdrop-blur-sm ${message.type === 'success'
                            ? 'bg-green-50/90 text-green-700 border border-green-200'
                            : 'bg-red-50/90 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-1">
                                Correo Electrónico
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-500/30"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enviar enlace'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800">
                <div className="mb-6">
                    <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al inicio de sesión
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recuperar Contraseña</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-sm text-center mb-6 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar enlace'}
                    </button>
                </form>
            </div>
        </div>
    );
}

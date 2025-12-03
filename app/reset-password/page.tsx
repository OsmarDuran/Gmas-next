'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import WaterBackground from "@/app/components/WaterBackground";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!token) {
        return (
            <div className="text-center">
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-4">
                    Token inválido o faltante.
                </div>
                <Link href="/login" className="text-blue-600 hover:underline">
                    Volver al inicio de sesión
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Contraseña restablecida correctamente. Redirigiendo...' });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al restablecer la contraseña' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Restablecer Contraseña</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ingresa tu nueva contraseña a continuación.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm text-center mb-6 flex items-center justify-center gap-2 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Restablecer Contraseña'}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <WaterBackground variant="deep" showSunkenShip />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-zinc-800/50">
                    <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

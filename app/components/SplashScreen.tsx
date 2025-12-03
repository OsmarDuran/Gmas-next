import { Loader2, Command } from 'lucide-react';
import WaterBackground from "@/app/components/WaterBackground";
import { useEffect, useState } from 'react';

interface SplashScreenProps {
    message?: string;
    mode?: 'login' | 'logout';
}

export default function SplashScreen({ message = "Iniciando sesión...", mode = 'login' }: SplashScreenProps) {
    const [isSubmerging, setIsSubmerging] = useState(false);
    const [isEmerging, setIsEmerging] = useState(mode === 'logout');

    useEffect(() => {
        if (mode === 'login') {
            const timer = setTimeout(() => {
                setIsSubmerging(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            // Logout mode: Start emerging immediately
            const timer = setTimeout(() => {
                setIsEmerging(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [mode]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
            <WaterBackground variant="surface" isSubmerging={isSubmerging} isEmerging={mode === 'logout'} />

            <div className={`relative z-30 flex flex-col items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-800/50 transition-opacity duration-1000 ${isSubmerging ? 'opacity-0' : 'opacity-100'} ${mode === 'logout' ? 'animate-in fade-in duration-1000' : ''}`}>
                {/* Logo Container with Pulse Effect */}
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-8 animate-bounce">
                    <Command className="w-12 h-12 text-white" />
                </div>

                {/* Text with Slide Up Animation */}
                <div className="text-center space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-forwards">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        GMAS 2.0
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {message}
                    </p>
                </div>

                {/* Loading Spinner */}
                <div className="mt-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        </div>
    );
}

import { Loader2, Command } from 'lucide-react';

interface SplashScreenProps {
    message?: string;
}

export default function SplashScreen({ message = "Iniciando sesión..." }: SplashScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
                {/* Logo Container with Pulse Effect */}
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-8 animate-bounce">
                    <Command className="w-12 h-12 text-white" />
                </div>

                {/* Text with Slide Up Animation */}
                <div className="text-center space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-forwards">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        GMAS 2.0
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {message}
                    </p>
                </div>

                {/* Loading Spinner */}
                <div className="mt-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        </div>
    );
}

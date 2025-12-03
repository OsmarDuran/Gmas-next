"use client";

import React, { useEffect, useState } from "react";
import Sun from "./assets/Sun";
import Boat from "./assets/Boat";
import SunkenShip from "./assets/SunkenShip";

interface Bubble {
    id: number;
    left: string;
    size: string;
    duration: string;
    delay: string;
    driftMid: string;
    driftEnd: string;
}

interface WaterBackgroundProps {
    variant?: 'surface' | 'deep' | 'sunset';
    showSun?: boolean;
    showBoat?: boolean;
    showSunkenShip?: boolean;
    isSubmerging?: boolean;
    isEmerging?: boolean;
}

export default function WaterBackground({
    variant = 'surface',
    showSun = false,
    showBoat = false,
    showSunkenShip = false,
    isSubmerging = false,
    isEmerging = false
}: WaterBackgroundProps) {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 15 + 5}px`,
            duration: `${Math.random() * 10 + 15}s`,
            delay: `${Math.random() * 10}s`,
            driftMid: `${(Math.random() - 0.5) * 200}px`,
            driftEnd: `${(Math.random() - 0.5) * 300}px`,
        }));
        setBubbles(newBubbles);
    }, []);

    const getGradientClass = () => {
        switch (variant) {
            case 'deep':
                return "bg-gradient-to-b from-blue-900 via-blue-950 to-black";
            case 'sunset':
                return ""; // Handled by inline style
            case 'surface':
            default:
                return "bg-gradient-to-b from-blue-400 to-blue-800";
        }
    };

    const sunsetStyle = variant === 'sunset' ? {
        background: `linear-gradient(to bottom, 
            #2d1b4e 0%, 
            #7a4c75 30%, 
            #d67d62 50%, 
            #f5cc75 60%, 
            #1a3b5c 60%, 
            #0f203b 100%)`
    } : {};

    return (
        <div
            className={`fixed inset-0 z-0 overflow-hidden ${getGradientClass()} ${isSubmerging ? 'animate-submerge-darken' : ''} ${isEmerging ? 'animate-emerge-lighten' : ''}`}
            style={sunsetStyle}
        >
            {/* Sunset Sun - Only for sunset variant */}
            {variant === 'sunset' && !isSubmerging && !isEmerging && (
                <div className="absolute left-1/2 -translate-x-1/2 top-[60%] -translate-y-1/2 w-96 h-96 z-0 pointer-events-none">
                    {/* Glow effect */}
                    <div className="w-full h-full rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,1) 5%, rgba(255,226,138,0.8) 20%, rgba(255,190,100,0.4) 40%, rgba(255,150,50,0) 70%)',
                            filter: 'blur(20px)',
                            transform: 'translateY(-20%)'
                        }}
                    />
                </div>
            )}

            {/* Sun Component - For other variants */}
            {showSun && variant !== 'sunset' && !isSubmerging && !isEmerging && (
                <div className="absolute top-10 right-10 w-24 h-24 z-10">
                    <Sun />
                </div>
            )}

            {/* Boat */}
            {showBoat && !isSubmerging && !isEmerging && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 z-10 animate-bob">
                    <Boat />
                </div>
            )}

            {/* Sunken Ship */}
            {showSunkenShip && (
                <div className="absolute bottom-0 right-20 w-64 h-64 z-10 opacity-80">
                    <SunkenShip />
                </div>
            )}

            <div className={`absolute bottom-0 left-0 right-0 w-full ${variant === 'sunset' ? 'h-[55%] z-20' : 'h-full'} ${isSubmerging ? 'animate-submerge-water' : ''} ${isEmerging ? 'animate-emerge-water' : ''}`}>
                {/* Wave 1 */}
                <div className={`absolute bottom-0 w-[200%] h-full animate-wave-slow ${variant === 'sunset' ? 'opacity-30' : 'opacity-30'}`}>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                        <path fill={variant === 'sunset' ? '#1a3b5c' : '#ffffff'} fillOpacity="1" d="M0,192L60,186.7C120,181,240,171,360,176C480,181,600,203,720,202.7C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Wave 2 */}
                <div className={`absolute bottom-0 w-[200%] h-full animate-wave-medium delay-75 ${variant === 'sunset' ? 'opacity-20' : 'opacity-20'}`}>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                        <path fill={variant === 'sunset' ? '#0f203b' : '#ffffff'} fillOpacity="1" d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,128C840,128,960,160,1080,170.7C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Wave 3 */}
                <div className={`absolute bottom-0 w-[200%] h-full animate-wave-fast delay-150 ${variant === 'sunset' ? 'opacity-10' : 'opacity-10'}`}>
                    <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                        <path fill={variant === 'sunset' ? '#0a1525' : '#ffffff'} fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,229.3C840,235,960,213,1080,202.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* Bubbles/Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {bubbles.map((bubble) => (
                    <div
                        key={bubble.id}
                        className="absolute rounded-full bg-white/10 animate-rise"
                        style={{
                            left: bubble.left,
                            width: bubble.size,
                            height: bubble.size,
                            bottom: '-20px',
                            animationDuration: bubble.duration,
                            animationDelay: bubble.delay,
                            // @ts-ignore
                            "--drift-mid": bubble.driftMid,
                            "--drift-end": bubble.driftEnd,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

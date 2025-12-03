"use client";

import React from "react";

export default function Sun({ className }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#FDB813" stopOpacity="1" />
                        <stop offset="60%" stopColor="#FDB813" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#FDB813" stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Rays - Counter Clockwise */}
                <g className="origin-center animate-spin-reverse-slow" style={{ transformBox: 'fill-box' }}>
                    {[...Array(12)].map((_, i) => (
                        <line
                            key={i}
                            x1="50"
                            y1="50"
                            x2="50"
                            y2="5"
                            stroke="url(#sun-glow)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            transform={`rotate(${i * 30} 50 50)`}
                            style={{ filter: 'url(#glow-blur)' }}
                        />
                    ))}
                </g>

                {/* Core - Clockwise */}
                <g className="origin-center animate-spin-slow" style={{ transformBox: 'fill-box' }}>
                    <circle cx="50" cy="50" r="20" className="fill-yellow-500" />
                    {/* Subtle detail to show rotation */}
                    <circle cx="60" cy="45" r="3" className="fill-yellow-400/50" />
                </g>
            </svg>
        </div>
    );
}

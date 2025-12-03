"use client";

import React from "react";

export default function SunkenShip({ className }: { className?: string }) {
    return (
        <div className={`relative ${className} opacity-60`}>
            <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: "rotate(15deg)" }}>
                {/* Broken Mast */}
                <rect x="90" y="60" width="6" height="80" className="fill-zinc-800" transform="rotate(20 93 140)" />

                {/* Hull */}
                <path d="M30,120 L170,120 L150,160 L50,160 Z" className="fill-zinc-900" />

                {/* Damage/Holes */}
                <circle cx="70" cy="140" r="5" className="fill-black/50" />
                <circle cx="100" cy="145" r="8" className="fill-black/50" />
                <circle cx="130" cy="135" r="6" className="fill-black/50" />
            </svg>
        </div>
    );
}

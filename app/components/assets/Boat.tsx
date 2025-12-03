"use client";

import React from "react";

export default function Boat({ className }: { className?: string }) {
    return (
        <div className={`relative ${className} animate-bob`}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                {/* Sail */}
                <path d="M100,20 L100,110 L160,110 Z" className="fill-white" />
                <path d="M95,30 L95,110 L40,110 Z" className="fill-gray-200" />

                {/* Mast */}
                <rect x="97" y="20" width="6" height="100" className="fill-amber-800" />

                {/* Hull */}
                <path d="M30,120 L170,120 L150,160 L50,160 Z" className="fill-amber-700" />
                <path d="M30,120 L170,120 L150,130 L50,130 Z" className="fill-amber-900 opacity-30" />
            </svg>
        </div>
    );
}

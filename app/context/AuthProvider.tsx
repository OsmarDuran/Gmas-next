"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: number;
    email: string;
    nombre: string;
    rol: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem("gmas_user");
        console.log("AuthProvider mount. Stored user:", storedUser);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        console.log("AuthProvider login:", userData);
        setUser(userData);
        localStorage.setItem("gmas_user", JSON.stringify(userData));

        if (userData.rol === 'employee') {
            console.log("Redirecting to /mis-equipos");
            router.push("/mis-equipos");
        } else {
            console.log("Redirecting to /dashboard");
            router.push("/dashboard");
        }
    };

    const logout = async () => {
        console.log("AuthProvider logout called");

        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Error calling logout api", error);
        }

        localStorage.removeItem("gmas_user");
        setUser(null);

        // Usar window.location para forzar recarga y limpiar estado de memoria/router
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

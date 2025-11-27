"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.rol === "employee") {
        router.push("/mis-equipos");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando GMAS 2.0...</p>
      </div>
    </div>
  );
}

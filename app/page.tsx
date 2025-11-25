import { getDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "./components/StatCard";
import { Users, Monitor, CheckCircle, AlertTriangle, Smartphone, FileText, Server } from "lucide-react";

export const dynamic = 'force-dynamic'; // Asegurar que no se cachee estáticamente

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen General</h1>
        {/* <span className="text-sm text-gray-500">Última actualización: {new Date().toLocaleTimeString()}</span> */}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsuarios}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Equipos"
          value={stats.totalEquipos}
          icon={Server}
          color="gray"
        />
        <StatCard
          title="Asignaciones Activas"
          value={stats.asignacionesActivas}
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="SIMs Disponibles"
          value={stats.simDisponibles}
          icon={Smartphone}
          color="yellow"
        />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8">Estado del Inventario</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Disponibles"
          value={stats.equiposDisponibles}
          icon={CheckCircle}
          color="green"
          description="Equipos listos para asignar"
        />
        <StatCard
          title="Asignados"
          value={stats.equiposAsignados}
          icon={Monitor}
          color="blue"
          description="Equipos en uso por personal"
        />
        <StatCard
          title="En Reparación"
          value={stats.equiposEnReparacion}
          icon={AlertTriangle}
          color="red"
          description="Equipos en mantenimiento"
        />
      </div>
    </div>
  );
}

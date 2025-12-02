import { getDashboardStats, getDashboardChartData } from "@/lib/data/dashboard";
import { StatCard } from "@/app/components/StatCard";
import { DashboardCharts } from "@/app/components/dashboard/DashboardCharts";
import { ProfileCard } from "@/app/components/dashboard/ProfileCard";
import { Users, Monitor, CheckCircle, AlertTriangle, Smartphone, FileText, Server } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const [stats, chartData] = await Promise.all([
        getDashboardStats(),
        getDashboardChartData()
    ]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Column - Profile & Quick Actions */}
            <div className="xl:col-span-1 space-y-6">
                <ProfileCard />

                {/* Additional widgets could go here to match reference "Connected Platform", "Featured Tags" etc. */}

            </div>

            {/* Main Content - Stats & Charts */}
            <div className="xl:col-span-3 space-y-6">
                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Equipos Disponibles"
                        value={stats.equiposDisponibles}
                        icon={CheckCircle}
                        color="cyan"
                        variant="solid"
                        trend={stats.availableTrend}
                        trendLabel="vs mes pasado"
                    />
                    <StatCard
                        title="Asignaciones"
                        value={stats.asignacionesActivas}
                        icon={FileText}
                        color="blue"
                        variant="solid"
                        trend={stats.assignmentTrend}
                        trendLabel="vs mes pasado"
                    />
                    <StatCard
                        title="En Reparación"
                        value={stats.equiposEnReparacion}
                        icon={AlertTriangle}
                        color="orange"
                        variant="solid"
                        trend={stats.reparacionTrend}
                        trendLabel="vs mes pasado"
                    />
                </div>

                {/* Charts Section */}
                <div>
                    <DashboardCharts data={chartData} />
                </div>

                {/* Secondary Stats Row */}
                <h2 className="text-lg font-bold text-[var(--color-brand-dark)] dark:text-white mt-8 mb-4">Estado del Inventario</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Usuarios"
                        value={stats.totalUsuarios}
                        icon={Users}
                        color="purple"
                        description="Usuarios activos"
                        trend={stats.userTrend}
                    />
                    <StatCard
                        title="Asignados"
                        value={stats.equiposAsignados}
                        icon={Monitor}
                        color="blue"
                        description="En uso por personal"
                        trend={stats.equiposAsignadosTrend}
                    />
                    <StatCard
                        title="SIMs Disp."
                        value={stats.simDisponibles}
                        icon={Smartphone}
                        color="orange"
                        description="Chips disponibles"
                    />
                    <StatCard
                        title="Total Equipos"
                        value={stats.totalEquipos}
                        icon={Server}
                        color="gray"
                        description="Inventario total"
                        trend={stats.equipmentTrend}
                    />
                </div>
            </div>
        </div>
    );
}

"use client";

import { Badge, Card, StatCard } from "@/components/ui";
import { useBoletas } from "@/components/hooks";
import { CheckCircle2, Clock3, FileText, Timer } from "lucide-react";

export default function DashboardPage() {
  const { boletas, loaded } = useBoletas();

  if (!loaded) return null;

  const total = boletas.length;
  const pendientes = boletas.filter((b) => b.estado === "Pendiente").length;
  const resueltas = boletas.filter((b) => b.estado === "Resuelta").length;
  const tiempoProm = "1.8 días";

  const porEstado = [
    { label: "Pendiente", count: pendientes, color: "bg-amber-400" },
    { label: "Asignada", count: boletas.filter((b) => b.estado === "Asignada").length, color: "bg-paypal-blue" },
    { label: "En atención", count: boletas.filter((b) => b.estado === "En atención").length, color: "bg-indigo-500" },
    { label: "Resuelta", count: resueltas, color: "bg-emerald-500" },
  ];
  const max = Math.max(...porEstado.map((e) => e.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Dashboard estadístico</h1>
        <p className="text-sm text-slate-500">Estado general de las boletas de error del sistema.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Boletas totales" value={total} icon={<FileText size={22} />} tone="blue" />
        <StatCard title="Pendientes" value={pendientes} icon={<Clock3 size={22} />} tone="amber" />
        <StatCard title="Resueltas" value={resueltas} icon={<CheckCircle2 size={22} />} tone="green" />
        <StatCard title="Tiempo promedio de atención" value={tiempoProm} icon={<Timer size={22} />} tone="dark" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="mb-6 font-bold text-paypal-dark">Boletas por estado</h3>
          <div className="space-y-4">
            {porEstado.map((e) => (
              <div key={e.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-600">{e.label}</span>
                  <span className="font-bold text-paypal-dark">{e.count}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-paypal-light">
                  <div
                    className={`h-full rounded-full ${e.color} transition-all duration-700`}
                    style={{ width: `${(e.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-bold text-paypal-dark">Últimas boletas registradas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-paypal-border text-left text-xs uppercase text-slate-400">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Solicitante</th>
                  <th className="pb-2 pr-4">Prioridad</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {boletas.slice(-5).reverse().map((b) => (
                  <tr key={b.id} className="border-b border-paypal-light last:border-0">
                    <td className="py-2.5 pr-4 font-bold text-paypal-blue">{b.id}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{b.solicitante}</td>
                    <td className="py-2.5 pr-4"><Badge value={b.prioridad} /></td>
                    <td className="py-2.5"><Badge value={b.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

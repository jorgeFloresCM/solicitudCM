"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Input, Select, StatCard } from "@/components/ui";
import { useBoletas } from "@/components/hooks";
import { Boleta, EstadoBoleta, UNIDADES } from "@/lib/data";
import { CheckCircle2, Clock3, FileText } from "lucide-react";

export default function ReportesPage() {
  const { boletas, loaded } = useBoletas();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estado, setEstado] = useState<EstadoBoleta | "Todos">("Todos");
  const [unidad, setUnidad] = useState("Todas");

  const filtradas: Boleta[] = useMemo(
    () =>
      boletas.filter(
        (b) =>
          (!desde || b.fecha >= desde) &&
          (!hasta || b.fecha <= hasta) &&
          (estado === "Todos" || b.estado === estado) &&
          (unidad === "Todas" || b.unidad === unidad)
      ),
    [boletas, desde, hasta, estado, unidad]
  );

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Reportes e historial</h1>
        <p className="text-sm text-slate-500">Boletas atendidas y pendientes con filtros dinámicos.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoBoleta | "Todos")}>
            <option value="Todos">Todos</option>
            <option>Pendiente</option>
            <option>Asignada</option>
            <option>En atención</option>
            <option>Resuelta</option>
          </Select>
          <Select label="Unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)}>
            <option value="Todas">Todas</option>
            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Boletas en reporte" value={filtradas.length} icon={<FileText size={22} />} tone="blue" />
        <StatCard title="Pendientes" value={filtradas.filter((b) => b.estado === "Pendiente").length} icon={<Clock3 size={22} />} tone="amber" />
        <StatCard title="Resueltas" value={filtradas.filter((b) => b.estado === "Resuelta").length} icon={<CheckCircle2 size={22} />} tone="green" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paypal-light">
            <tr className="text-left text-xs uppercase text-slate-500">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Unidad</th>
              <th className="px-6 py-3">Tipo de error</th>
              <th className="px-6 py-3">Técnico</th>
              <th className="px-6 py-3">Prioridad</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((b) => (
              <tr key={b.id} className="border-t border-paypal-border hover:bg-paypal-light/50">
                <td className="px-6 py-3 font-bold text-paypal-blue">{b.id}</td>
                <td className="px-6 py-3 text-slate-600">{b.fecha}</td>
                <td className="px-6 py-3 text-slate-600">{b.unidad}</td>
                <td className="px-6 py-3 text-slate-600">{b.tipoError}</td>
                <td className="px-6 py-3 text-slate-600">{b.tecnico ?? "—"}</td>
                <td className="px-6 py-3"><Badge value={b.prioridad} /></td>
                <td className="px-6 py-3"><Badge value={b.estado} /></td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No hay resultados con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

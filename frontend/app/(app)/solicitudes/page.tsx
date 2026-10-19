"use client";

import { useState } from "react";
import { Badge, Card, Select } from "@/components/ui";
import { useBoletas } from "@/components/hooks";
import { Boleta, EstadoBoleta, TECNICOS } from "@/lib/data";
import { Inbox } from "lucide-react";

const ESTADOS: EstadoBoleta[] = ["Pendiente", "Asignada", "En atención", "Resuelta"];

export default function SolicitudesPage() {
  const { boletas, update } = useBoletas();
  const [filtro, setFiltro] = useState<EstadoBoleta | "Todas">("Todas");

  const visibles = filtro === "Todas" ? boletas : boletas.filter((b) => b.estado === filtro);

  const asignar = (id: string, tecnico: string) => {
    update(
      boletas.map((b) =>
        b.id === id ? { ...b, tecnico, estado: b.estado === "Pendiente" ? "Asignada" : b.estado } : b
      )
    );
  };

  const cambiarEstado = (id: string, estado: EstadoBoleta) => {
    update(boletas.map((b) => (b.id === id ? { ...b, estado } : b)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-paypal-dark">Bandeja de solicitudes</h1>
          <p className="text-sm text-slate-500">Boletas entrantes y asignación de técnicos responsables.</p>
        </div>
        <div className="flex items-center gap-2">
          <Inbox size={18} className="text-paypal-blue" />
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as EstadoBoleta | "Todas")}
            className="rounded-full border border-paypal-border bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-paypal-blue"
          >
            <option value="Todas">Todas</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {visibles.length === 0 && (
          <Card className="text-center text-sm text-slate-400">No hay boletas con ese estado.</Card>
        )}
        {visibles.map((b: Boleta) => (
          <Card key={b.id} className="!p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-paypal-blue">{b.id}</span>
                  <Badge value={b.prioridad} />
                  <Badge value={b.estado} />
                  <span className="text-xs text-slate-400">{b.fecha}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {b.tipoError} · {b.unidad}
                </p>
                <p className="mt-1 text-sm text-slate-500">{b.descripcion}</p>
                <p className="mt-1 text-xs text-slate-400">Solicitante: {b.solicitante}</p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-56">
                <Select
                  value={b.tecnico ?? ""}
                  onChange={(e) => asignar(b.id, e.target.value)}
                >
                  <option value="" disabled>Asignar técnico…</option>
                  {TECNICOS.map((t) => <option key={t}>{t}</option>)}
                </Select>
                <Select
                  value={b.estado}
                  onChange={(e) => cambiarEstado(b.id, e.target.value as EstadoBoleta)}
                >
                  {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

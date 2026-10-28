"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { Card, Input } from "@/components/ui";
import { DescripcionEvento } from "@/components/historial";
import { api, mensajeError } from "@/lib/api";
import { EventoHistorial } from "@/lib/data";

/** Registro general de operaciones sobre las boletas. Solo consulta. */
export default function TrazabilidadPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [boletaId, setBoletaId] = useState("");
  const [usuario, setUsuario] = useState("");
  const [eventos, setEventos] = useState<EventoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const qs = new URLSearchParams();
    if (desde) qs.set("desde", desde);
    if (hasta) qs.set("hasta", hasta);
    if (boletaId.trim()) qs.set("boletaId", boletaId.trim());
    if (usuario.trim()) qs.set("usuario", usuario.trim());
    try {
      setEventos(await api<EventoHistorial[]>(`/boletas/trazabilidad/registro${qs.toString() ? `?${qs}` : ""}`));
      setError(null);
    } catch (e) {
      setError(mensajeError(e));
    }
  }, [desde, hasta, boletaId, usuario]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="text-paypal-blue" />
        <div>
          <h1 className="text-2xl font-extrabold text-paypal-dark">Trazabilidad</h1>
          <p className="text-sm text-slate-500">Quién hizo qué sobre cada boleta, y cuándo. Solo consulta; se muestran las últimas 500 operaciones.</p>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <Input label="Boleta" placeholder="BOL-2026-001" value={boletaId} onChange={(e) => setBoletaId(e.target.value)} />
          <Input label="Usuario" placeholder="Nombre" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </div>
      </Card>

      {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <Card>
        {eventos === null && !error && <p className="text-sm text-slate-400">Cargando…</p>}
        {eventos && eventos.length === 0 && <p className="text-center text-sm text-slate-400">No hay operaciones con esos filtros.</p>}
        {eventos && eventos.length > 0 && (
          <ul className="divide-y divide-paypal-border">
            {eventos.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-4 py-3">
                <span className="w-32 shrink-0 text-sm font-extrabold text-paypal-blue">{e.boletaId}</span>
                <DescripcionEvento e={e} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

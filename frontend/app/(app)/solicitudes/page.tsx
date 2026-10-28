"use client";

import { useState } from "react";
import { Badge, Button, Card, Modal, Select, Textarea } from "@/components/ui";
import { useBoletas, useCatalogos, useSession } from "@/components/hooks";
import { DescripcionEvento } from "@/components/historial";
import { api, mensajeError } from "@/lib/api";
import { Boleta, EstadoBoleta, EventoHistorial } from "@/lib/data";
import { History, Inbox } from "lucide-react";

const ESTADOS: EstadoBoleta[] = ["Pendiente", "Asignada", "En atención", "Observada", "Resuelta"];

export default function SolicitudesPage() {
  const { boletas, actualizar, error: errorCarga } = useBoletas();
  const cat = useCatalogos();
  const [filtro, setFiltro] = useState<EstadoBoleta | "Todas">("Todas");
  const [error, setError] = useState<string | null>(null);
  const me = useSession();
  // El Administrador supervisa: ve todas las boletas pero no las modifica
  const soloLectura = me?.rol === "Administrador";

  // Observar una boleta exige un motivo: se pide antes de guardar
  const [observando, setObservando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);

  // Historial de una boleta
  const [verHistorial, setVerHistorial] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoHistorial[] | null>(null);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const abrirHistorial = async (id: string) => {
    setVerHistorial(id);
    setEventos(null);
    setErrorHistorial(null);
    try {
      setEventos(await api<EventoHistorial[]>(`/boletas/${id}/historial`));
    } catch (e) {
      setErrorHistorial(mensajeError(e));
    }
  };

  const cambiarEstado = (id: string, estado: EstadoBoleta) => {
    if (estado === "Observada") {
      setMotivo("");
      setErrorMotivo(null);
      setObservando(id);
    } else {
      guardar(id, { estado });
    }
  };

  const confirmarObservacion = async () => {
    if (motivo.trim().length < 3) {
      setErrorMotivo("Debes indicar el motivo de la observación");
      return;
    }
    if (!observando) return;
    setError(null);
    try {
      await actualizar(observando, { estado: "Observada", motivo: motivo.trim() });
      setObservando(null);
    } catch (e) {
      setErrorMotivo(mensajeError(e));
    }
  };

  const visibles = filtro === "Todas" ? boletas : boletas.filter((b) => b.estado === filtro);

  const guardar = async (id: string, cambios: { tecnicoId?: number; estado?: EstadoBoleta; motivo?: string }) => {
    setError(null);
    try {
      await actualizar(id, cambios);
    } catch (e) {
      setError(mensajeError(e));
    }
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

      {(error || errorCarga) && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error ?? errorCarga}</div>
      )}

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
                {soloLectura ? (
                  <p className="text-xs text-slate-500">
                    Técnico: <span className="font-semibold text-slate-700">{b.tecnico ?? "Sin asignar"}</span>
                  </p>
                ) : (
                <>
                <Select
                  value={b.tecnicoId ?? ""}
                  onChange={(e) => guardar(b.id, { tecnicoId: Number(e.target.value) })}
                >
                  <option value="" disabled>Asignar técnico…</option>
                  {cat?.tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </Select>
                <Select
                  value={b.estado}
                  onChange={(e) => cambiarEstado(b.id, e.target.value as EstadoBoleta)}
                >
                  {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                </Select>
                </>
                )}
                <button
                  type="button"
                  onClick={() => abrirHistorial(b.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-paypal-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-paypal-blue hover:text-paypal-blue"
                >
                  <History size={14} /> Historial
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={observando !== null} onClose={() => setObservando(null)} title={`Observar ${observando ?? ""}`}>
        <div className="space-y-4">
          <Textarea
            label="Motivo de la observación"
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica qué falta o por qué se observa la boleta"
            maxLength={500}
          />
          {errorMotivo && <p role="alert" className="text-sm font-semibold text-red-600">{errorMotivo}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setObservando(null)}>Cancelar</Button>
            <Button onClick={confirmarObservacion}>Guardar observación</Button>
          </div>
        </div>
      </Modal>

      <Modal open={verHistorial !== null} onClose={() => setVerHistorial(null)} title={`Historial de ${verHistorial ?? ""}`}>
        {errorHistorial && <p role="alert" className="text-sm font-semibold text-red-600">{errorHistorial}</p>}
        {!errorHistorial && eventos === null && <p className="text-sm text-slate-400">Cargando…</p>}
        {eventos && eventos.length === 0 && <p className="text-sm text-slate-400">Esta boleta no tiene operaciones registradas.</p>}
        {eventos && eventos.length > 0 && (
          <ol className="space-y-4 border-l-2 border-paypal-border pl-4">
            {eventos.map((e) => <li key={e.id}><DescripcionEvento e={e} /></li>)}
          </ol>
        )}
      </Modal>
    </div>
  );
}

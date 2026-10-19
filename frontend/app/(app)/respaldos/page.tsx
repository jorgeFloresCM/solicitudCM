"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Modal, Select } from "@/components/ui";
import { useBoletas } from "@/components/hooks";
import { api, mensajeError } from "@/lib/api";
import { Respaldo } from "@/lib/data";
import { Eye, FileText, Trash2, Upload } from "lucide-react";

export default function RespaldosPage() {
  const { boletas } = useBoletas();
  const [respaldos, setRespaldos] = useState<Respaldo[]>([]);
  const [visor, setVisor] = useState<Respaldo | null>(null);
  const [boletaId, setBoletaId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = () =>
    api<Respaldo[]>("/respaldos").then(setRespaldos).catch((e) => setError(mensajeError(e)));
  useEffect(() => {
    cargar();
  }, []);

  // Boleta destino por defecto: la más reciente
  useEffect(() => {
    if (!boletaId && boletas.length) setBoletaId(boletas[0].id);
  }, [boletas, boletaId]);

  const agregar = async (files: FileList | null) => {
    if (!files?.length || !boletaId) return;
    setError(null);
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("boletaId", boletaId);
      Array.from(files).forEach((f) => fd.append("archivos", f));
      await api("/respaldos", { method: "POST", body: fd });
      await cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setSubiendo(false);
    }
  };

  const eliminar = async (id: string) => {
    if (!window.confirm("¿Eliminar este respaldo? Esta acción no se puede deshacer.")) return;
    setError(null);
    try {
      await api(`/respaldos/${id}`, { method: "DELETE" });
      setRespaldos((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const esImagen = (r: Respaldo) => r.tipo.startsWith("image/");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Respaldos digitalizados</h1>
        <p className="text-sm text-slate-500">Adjunta, previsualiza y elimina archivos sustento (PDF, imágenes).</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      <Card>
        <div className="mb-4 max-w-xs">
          <Select label="Boleta a la que se asociarán" value={boletaId} onChange={(e) => setBoletaId(e.target.value)}>
            {boletas.map((b) => <option key={b.id} value={b.id}>{b.id} · {b.tipoError}</option>)}
          </Select>
        </div>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-paypal-border py-12 text-slate-400 transition hover:border-paypal-blue hover:text-paypal-blue">
          <Upload size={32} />
          <span className="text-sm font-bold">{subiendo ? "Subiendo…" : "Haz clic para adjuntar archivos"}</span>
          <span className="text-xs">Formatos aceptados: PDF, PNG, JPG, WEBP · máx. 10 MB por archivo</span>
          <input
            type="file"
            className="hidden"
            multiple
            disabled={subiendo || !boletaId}
            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => {
              agregar(e.target.files);
              e.target.value = ""; // permite volver a elegir el mismo archivo
            }}
          />
        </label>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {respaldos.map((r) => (
          <Card key={r.id} className="!p-4">
            <div className="mb-3 flex h-28 items-center justify-center overflow-hidden rounded-xl bg-paypal-light">
              {esImagen(r) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.url} alt={r.nombre} className="h-full w-full object-cover" />
              ) : (
                <FileText size={36} className="text-paypal-blue" />
              )}
            </div>
            <p className="truncate text-sm font-bold text-slate-800" title={r.nombre}>{r.nombre}</p>
            <p className="mb-3 text-xs text-slate-400">{r.boletaId} · {r.fecha}</p>
            <div className="flex items-center justify-between">
              <Badge value={esImagen(r) ? "Imagen" : "PDF"} />
              <div className="flex gap-2">
                <Button variant="ghost" className="!px-2.5 !py-1.5" onClick={() => setVisor(r)}>
                  <Eye size={15} />
                </Button>
                <Button variant="danger" className="!px-2.5 !py-1.5" onClick={() => eliminar(r.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {respaldos.length === 0 && (
          <Card className="col-span-full text-center text-sm text-slate-400">
            Aún no se adjuntaron respaldos.
          </Card>
        )}
      </div>

      <Modal open={!!visor} onClose={() => setVisor(null)} title={visor?.nombre ?? ""} wide>
        {visor &&
          (esImagen(visor) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={visor.url} alt={visor.nombre} className="mx-auto max-h-[65vh] rounded-xl" />
          ) : (
            <iframe src={visor.url} className="h-[65vh] w-full rounded-xl" title={visor.nombre} />
          ))}
      </Modal>
    </div>
  );
}

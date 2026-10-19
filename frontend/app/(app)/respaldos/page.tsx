"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Modal } from "@/components/ui";
import { getRespaldos, Respaldo, saveRespaldos } from "@/lib/data";
import { Eye, FileText, Trash2, Upload } from "lucide-react";

export default function RespaldosPage() {
  const [respaldos, setRespaldos] = useState<Respaldo[]>([]);
  const [visor, setVisor] = useState<Respaldo | null>(null);
  const [boletaId, setBoletaId] = useState("BOL-2026-001");

  useEffect(() => setRespaldos(getRespaldos()), []);

  const agregar = (files: FileList | null) => {
    if (!files) return;
    const nuevos: Respaldo[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      boletaId,
      nombre: f.name,
      tipo: f.type,
      url: URL.createObjectURL(f),
      fecha: new Date().toISOString().slice(0, 10),
    }));
    const next = [...respaldos, ...nuevos];
    setRespaldos(next);
    saveRespaldos(next);
  };

  const eliminar = (id: string) => {
    const next = respaldos.filter((r) => r.id !== id);
    setRespaldos(next);
    saveRespaldos(next);
  };

  const esImagen = (r: Respaldo) => r.tipo.startsWith("image/");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Respaldos digitalizados</h1>
        <p className="text-sm text-slate-500">Adjunta, previsualiza y elimina archivos sustento (PDF, imágenes).</p>
      </div>

      <Card>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-paypal-border py-12 text-slate-400 transition hover:border-paypal-blue hover:text-paypal-blue">
          <Upload size={32} />
          <span className="text-sm font-bold">Arrastra o haz clic para adjuntar archivos</span>
          <span className="text-xs">Formatos aceptados: PDF, PNG, JPG</span>
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,image/*"
            onChange={(e) => agregar(e.target.files)}
          />
        </label>
        <p className="mt-3 text-center text-xs text-slate-400">
          Los archivos se asociarán a la boleta <span className="font-bold text-paypal-blue">{boletaId}</span>
        </p>
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

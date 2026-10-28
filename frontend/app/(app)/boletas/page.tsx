"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { useCatalogos, useSession } from "@/components/hooks";
import { api, mensajeError } from "@/lib/api";
import { Boleta, Prioridad } from "@/lib/data";
import { FilePlus2, Send } from "lucide-react";

export default function BoletasPage() {
  const router = useRouter();
  const me = useSession();
  const cat = useCatalogos();
  const [form, setForm] = useState({
    solicitante: "",
    unidad: "",
    tipoError: "",
    prioridad: "Media" as Prioridad,
    descripcion: "",
  });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Valores por defecto: usuario en sesión y primer elemento de cada catálogo
  useEffect(() => {
    if (!cat) return;
    setForm((f) => ({
      ...f,
      solicitante: f.solicitante || me?.nombre || "",
      unidad: f.unidad || cat.unidades[0] || "",
      tipoError: f.tipoError || cat.tiposError[0] || "",
    }));
  }, [cat, me]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const nueva = await api<Boleta>("/boletas", { method: "POST", json: form });

      let avisoRespaldos = "";
      if (archivos.length) {
        const fd = new FormData();
        fd.append("boletaId", nueva.id);
        archivos.forEach((a) => fd.append("archivos", a));
        try {
          await api("/respaldos", { method: "POST", body: fd });
        } catch (err) {
          avisoRespaldos = ` Los respaldos no se pudieron subir (${mensajeError(err)}); puedes añadirlos en el módulo Respaldos.`;
        }
      }

      setOk(`✓ Boleta ${nueva.id} registrada correctamente.${avisoRespaldos}`);
      // Cada rol solo ve ciertas pantallas: la bandeja es para quienes atienden
      const destino = me && ["Jefe de Sistemas", "Técnico"].includes(me.rol) ? "/solicitudes" : "/dashboard";
      setTimeout(() => router.push(destino), avisoRespaldos ? 3500 : 1500);
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Registro de boleta de error</h1>
        <p className="text-sm text-slate-500">Describe el problema para que la Unidad de Informática pueda atenderlo.</p>
      </div>

      {ok && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{ok}</div>
      )}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      <Card>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paypal-blue/10 text-paypal-blue">
            <FilePlus2 size={20} />
          </div>
          <h3 className="font-bold text-paypal-dark">Detalle de la petición</h3>
        </div>

        <form onSubmit={enviar} className="space-y-5">
          <Input
            label="Nombre del solicitante"
            value={form.solicitante}
            onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Select label="Unidad solicitante" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
              {cat?.unidades.map((u) => <option key={u}>{u}</option>)}
            </Select>
            <Select label="Tipo de error" value={form.tipoError} onChange={(e) => setForm({ ...form, tipoError: e.target.value })}>
              {cat?.tiposError.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>

          <Select label="Prioridad" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value as Prioridad })}>
            <option value="Alta">Alta — impide el trabajo</option>
            <option value="Media">Media — afecta parcialmente</option>
            <option value="Baja">Baja — consulta general</option>
          </Select>

          <Textarea
            label="Descripción detallada del problema"
            rows={5}
            placeholder="Ej.: Al iniciar sesión en el sistema contable aparece el error «Conexión rechazada» desde el martes…"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
          />

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Respaldos digitalizados (opcional)</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-paypal-border py-8 text-slate-400 transition hover:border-paypal-blue hover:text-paypal-blue">
              <Send size={22} />
              <span className="text-sm font-semibold">
                {archivos.length ? `${archivos.length} archivo(s): ${archivos.map((a) => a.name).join(", ")}` : "Adjuntar PDF o imágenes (máx. 10 MB c/u)"}
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={enviando || !cat}><Send size={16} /> {enviando ? "Registrando…" : "Registrar boleta"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

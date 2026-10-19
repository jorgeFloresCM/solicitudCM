"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { getBoletas, saveBoletas, TIPOS_ERROR, UNIDADES, Prioridad } from "@/lib/data";
import { FilePlus2, Send } from "lucide-react";

export default function BoletasPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    solicitante: "",
    unidad: UNIDADES[0],
    tipoError: TIPOS_ERROR[0],
    prioridad: "Media" as Prioridad,
    descripcion: "",
  });
  const [ok, setOk] = useState(false);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const boletas = getBoletas();
    const nueva = {
      id: `BOL-2026-${String(boletas.length + 1).padStart(3, "0")}`,
      ...form,
      fecha: new Date().toISOString().slice(0, 10),
      estado: "Pendiente" as const,
    };
    saveBoletas([...boletas, nueva]);
    setOk(true);
    setTimeout(() => router.push("/solicitudes"), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-paypal-dark">Registro de boleta de error</h1>
        <p className="text-sm text-slate-500">Describe el problema para que la Unidad de Informática pueda atenderlo.</p>
      </div>

      {ok && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✓ Boleta registrada correctamente. Redirigiendo a la bandeja…
        </div>
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
              {UNIDADES.map((u) => <option key={u}>{u}</option>)}
            </Select>
            <Select label="Tipo de error" value={form.tipoError} onChange={(e) => setForm({ ...form, tipoError: e.target.value })}>
              {TIPOS_ERROR.map((t) => <option key={t}>{t}</option>)}
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
              <span className="text-sm font-semibold">Adjuntar PDF o imágenes (puedes añadir más en el módulo Respaldos)</span>
              <input type="file" className="hidden" multiple accept=".pdf,image/*" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit"><Send size={16} /> Registrar boleta</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

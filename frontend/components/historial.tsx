"use client";

import { Badge } from "@/components/ui";
import { EventoHistorial } from "@/lib/data";

export const formatoFechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short", timeZone: "America/La_Paz" });

/** Una línea por operación: quién, cuándo, qué y, si hay, el motivo */
export function DescripcionEvento({ e }: { e: EventoHistorial }) {
  return (
    <div className="min-w-0 text-sm">
      <p className="font-semibold text-slate-800">
        {e.accion}
        {e.estadoNuevo && (
          <span className="ml-2 inline-flex items-center gap-1 align-middle">
            {e.estadoAnterior && <><Badge value={e.estadoAnterior} /><span className="text-slate-400">→</span></>}
            <Badge value={e.estadoNuevo} />
          </span>
        )}
      </p>
      {e.detalle && <p className="text-slate-500">{e.detalle}</p>}
      {e.motivo && <p className="mt-1 rounded-lg bg-orange-50 px-3 py-1.5 text-orange-800">Motivo: {e.motivo}</p>}
      <p className="mt-0.5 text-xs text-slate-400">{e.usuario} ({e.rol}) · {formatoFechaHora(e.fecha)}</p>
    </div>
  );
}

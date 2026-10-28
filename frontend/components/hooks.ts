"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Boleta, Catalogos, EstadoBoleta, Usuario } from "@/lib/data";

/* ---------- Sesión (la provee el layout autenticado) ---------- */
export const SessionContext = createContext<Usuario | null>(null);
export const useSession = () => useContext(SessionContext);

/* ---------- Boletas ---------- */
export interface FiltrosBoletas {
  desde?: string;
  hasta?: string;
  estado?: string;
  unidad?: string;
}

export function useBoletas(filtros: FiltrosBoletas = {}) {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { desde, hasta, estado, unidad } = filtros;

  const reload = useCallback(async () => {
    const qs = new URLSearchParams();
    if (desde) qs.set("desde", desde);
    if (hasta) qs.set("hasta", hasta);
    if (estado) qs.set("estado", estado);
    if (unidad) qs.set("unidad", unidad);
    try {
      setBoletas(await api<Boleta[]>(`/boletas${qs.toString() ? `?${qs}` : ""}`));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las boletas");
    } finally {
      setLoaded(true);
    }
  }, [desde, hasta, estado, unidad]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Asigna técnico y/o cambia el estado; reemplaza la boleta con lo que devuelve el servidor */
  const actualizar = async (id: string, cambios: { tecnicoId?: number; estado?: EstadoBoleta; motivo?: string }) => {
    const nueva = await api<Boleta>(`/boletas/${id}`, { method: "PATCH", json: cambios });
    setBoletas((prev) => prev.map((b) => (b.id === id ? nueva : b)));
  };

  return { boletas, loaded, error, reload, actualizar };
}

/* ---------- Catálogos (unidades, tipos de error, técnicos, roles) ---------- */
export function useCatalogos() {
  const [cat, setCat] = useState<Catalogos | null>(null);
  useEffect(() => {
    api<Catalogos>("/catalogos").then(setCat).catch(() => undefined);
  }, []);
  return cat;
}

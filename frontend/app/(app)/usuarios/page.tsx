"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Modal, Select } from "@/components/ui";
import { useCatalogos } from "@/components/hooks";
import { api, mensajeError } from "@/lib/api";
import { Rol, Usuario } from "@/lib/data";
import { Pencil, Plus, UserRound } from "lucide-react";

type Form = { nombre: string; correo: string; unidad: string; rol: Rol; estado: "Activo" | "Inactivo"; password: string };

export default function UsuariosPage() {
  const cat = useCatalogos();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<Form>({ nombre: "", correo: "", unidad: "", rol: "Solicitante", estado: "Activo", password: "" });

  const cargar = () =>
    api<Usuario[]>("/usuarios").then(setUsuarios).catch((e) => setErrorCarga(mensajeError(e)));
  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setErrorForm(null);
    setForm({ nombre: "", correo: "", unidad: cat?.unidades[0] ?? "", rol: "Solicitante", estado: "Activo", password: "" });
    setModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setErrorForm(null);
    setForm({ nombre: u.nombre, correo: u.correo, unidad: u.unidad, rol: u.rol, estado: u.estado, password: "" });
    setModal(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardando(true);
    try {
      const { password, ...datos } = form;
      if (editando) {
        // La contraseña solo se envía si se escribió una nueva
        await api(`/usuarios/${editando.id}`, { method: "PATCH", json: password ? { ...datos, password } : datos });
      } else {
        await api("/usuarios", { method: "POST", json: form });
      }
      setModal(false);
      await cargar();
    } catch (err) {
      setErrorForm(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  // Incluye siempre la unidad actual del usuario aunque ya no esté en el catálogo
  const unidades = cat ? Array.from(new Set([...cat.unidades, ...(form.unidad ? [form.unidad] : [])])) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-paypal-dark">Gestión de usuarios</h1>
          <p className="text-sm text-slate-500">Ver, crear y editar usuarios del sistema.</p>
        </div>
        <Button onClick={abrirCrear} disabled={!cat}><Plus size={16} /> Nuevo usuario</Button>
      </div>

      {errorCarga && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorCarga}</div>
      )}

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paypal-light">
            <tr className="text-left text-xs uppercase text-slate-500">
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Unidad</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-paypal-border transition hover:bg-paypal-light/50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paypal-blue/10 text-paypal-blue">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.nombre}</p>
                      <p className="text-xs text-slate-400">{u.correo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-600">{u.unidad}</td>
                <td className="px-6 py-3"><Badge value={u.rol} /></td>
                <td className="px-6 py-3"><Badge value={u.estado} /></td>
                <td className="px-6 py-3 text-right">
                  <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => abrirEditar(u)}>
                    <Pencil size={14} /> Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? "Editar usuario" : "Crear usuario"}>
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorForm}</div>
          )}
          <Input label="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <Input label="Correo institucional" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
          <Input
            label={editando ? "Nueva contraseña (dejar vacío para no cambiarla)" : "Contraseña inicial"}
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editando}
          />
          <Select label="Unidad" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
            {unidades.map((u) => <option key={u}>{u}</option>)}
          </Select>
          <Select label="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
            {cat?.roles.map((r) => <option key={r}>{r}</option>)}
          </Select>
          <Select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as "Activo" | "Inactivo" })}>
            <option>Activo</option>
            <option>Inactivo</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

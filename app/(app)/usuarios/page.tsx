"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, Modal, Select } from "@/components/ui";
import { Rol, USUARIOS_INICIAL, Usuario, ROLES, UNIDADES } from "@/lib/data";
import { Pencil, Plus, UserRound } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIAL);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: "", correo: "", unidad: UNIDADES[0], rol: "Solicitante" as Rol, estado: "Activo" as "Activo" | "Inactivo" });

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: "", correo: "", unidad: UNIDADES[0], rol: "Solicitante", estado: "Activo" });
    setModal(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, correo: u.correo, unidad: u.unidad, rol: u.rol, estado: u.estado });
    setModal(true);
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (editando) {
      setUsuarios((prev) => prev.map((u) => (u.id === editando.id ? { ...u, ...form } : u)));
    } else {
      setUsuarios((prev) => [...prev, { id: Math.max(...prev.map((u) => u.id), 0) + 1, ...form }]);
    }
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-paypal-dark">Gestión de usuarios</h1>
          <p className="text-sm text-slate-500">Ver, crear y editar usuarios del sistema.</p>
        </div>
        <Button onClick={abrirCrear}><Plus size={16} /> Nuevo usuario</Button>
      </div>

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
          <Input label="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <Input label="Correo institucional" type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required />
          <Select label="Unidad" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
          </Select>
          <Select label="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </Select>
          <Select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as "Activo" | "Inactivo" })}>
            <option>Activo</option>
            <option>Inactivo</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

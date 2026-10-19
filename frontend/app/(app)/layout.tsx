"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldCheck, LayoutDashboard, Users, FilePlus2, Inbox,
  BarChart3, FolderOpen, LogOut,
} from "lucide-react";
import { Rol } from "@/lib/data";

const NAV: { href: string; label: string; icon: React.ReactNode; roles: Rol[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["Administrador", "Jefe de Sistemas", "Directivo", "Encargado", "Solicitante", "Técnico"] },
  { href: "/usuarios", label: "Usuarios", icon: <Users size={18} />, roles: ["Administrador"] },
  { href: "/boletas", label: "Nueva Boleta", icon: <FilePlus2 size={18} />, roles: ["Solicitante", "Administrador", "Encargado"] },
  { href: "/solicitudes", label: "Solicitudes", icon: <Inbox size={18} />, roles: ["Jefe de Sistemas", "Administrador", "Técnico"] },
  { href: "/reportes", label: "Reportes", icon: <BarChart3 size={18} />, roles: ["Encargado", "Jefe de Sistemas", "Directivo", "Administrador"] },
  { href: "/respaldos", label: "Respaldos", icon: <FolderOpen size={18} />, roles: ["Solicitante", "Técnico", "Administrador"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [rol, setRol] = useState<Rol>("Administrador");

  useEffect(() => {
    const saved = localStorage.getItem("rol") as Rol | null;
    if (saved) setRol(saved);
  }, []);

  const logout = () => {
    localStorage.removeItem("rol");
    router.push("/");
  };

  const items = NAV.filter((n) => n.roles.includes(rol));

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-paypal-dark text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <ShieldCheck size={30} className="text-paypal-sky" />
          <div>
            <p className="text-sm font-extrabold leading-tight">Consejo de la Magistratura</p>
            <p className="text-xs text-white/60">Unidad de Informática</p>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-paypal-blue text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 px-4 py-3">
            <p className="text-sm font-bold">Usuario Demo</p>
            <p className="text-xs text-paypal-sky">{rol}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}

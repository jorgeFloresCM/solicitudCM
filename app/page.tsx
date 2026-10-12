"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { ROLES, Rol } from "@/lib/data";
import { ShieldCheck, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [rol, setRol] = useState<Rol>("Administrador");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("rol", rol);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-paypal-dark via-paypal-blue to-paypal-sky p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <ShieldCheck size={36} />
          <div>
            <h1 className="text-xl font-extrabold leading-tight">Consejo de la Magistratura</h1>
            <p className="text-sm text-white/80">Unidad de Informática</p>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Sistema de Gestión de Solicitudes
          </h2>
          <p className="mt-4 max-w-md text-white/85">
            Registra, asigna y da seguimiento a las boletas de error de todas las unidades
            institucionales en un solo lugar.
          </p>
        </div>
        <p className="text-xs text-white/60">© 2026 Consejo de la Magistratura</p>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <form onSubmit={handleLogin} className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <ShieldCheck size={32} className="text-paypal-blue" />
            <h1 className="text-lg font-extrabold text-paypal-dark">Consejo de la Magistratura</h1>
          </div>
          <h2 className="text-3xl font-extrabold text-paypal-dark">Iniciar sesión</h2>
          <p className="mb-8 mt-2 text-sm text-slate-500">
            Ingresa con tus credenciales institucionales.
          </p>

          <div className="space-y-4">
            <Input label="Correo institucional" type="email" placeholder="usuario@cmag.gov.bo" required />
            <Input label="Contraseña" type="password" placeholder="••••••••" required />
            <Select label="Rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </div>

          <Button type="submit" className="mt-8 w-full py-3 text-base">
            <Lock size={16} /> Ingresar
          </Button>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <Mail size={14} /> ¿Problemas de acceso? Contacta a la Unidad de Informática
          </p>
        </form>
      </div>
    </div>
  );
}

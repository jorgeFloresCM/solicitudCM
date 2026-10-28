"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-150 disabled:opacity-50";
  const styles = {
    primary: "bg-paypal-blue text-white hover:bg-paypal-hover shadow-sm",
    secondary: "bg-paypal-sky/40 text-paypal-dark hover:bg-paypal-sky/70",
    ghost: "bg-transparent text-paypal-blue hover:bg-paypal-blue/10 border border-paypal-blue",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-card ${className}`}>{children}</div>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <input
        {...props}
        className="w-full rounded-xl border border-paypal-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-paypal-blue focus:ring-2 focus:ring-paypal-blue/20"
      />
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <textarea
        {...props}
        className="w-full rounded-xl border border-paypal-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-paypal-blue focus:ring-2 focus:ring-paypal-blue/20"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <select
        {...props}
        className="w-full rounded-xl border border-paypal-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-paypal-blue focus:ring-2 focus:ring-paypal-blue/20"
      >
        {children}
      </select>
    </label>
  );
}

const badgeColors: Record<string, string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Asignada: "bg-blue-100 text-paypal-blue",
  "En atención": "bg-indigo-100 text-indigo-700",
  Observada: "bg-orange-100 text-orange-700",
  Resuelta: "bg-emerald-100 text-emerald-700",
  Alta: "bg-red-100 text-red-700",
  Media: "bg-amber-100 text-amber-800",
  Baja: "bg-slate-100 text-slate-600",
  Activo: "bg-emerald-100 text-emerald-700",
  Inactivo: "bg-slate-100 text-slate-500",
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badgeColors[value] ?? "bg-slate-100 text-slate-600"}`}>
      {value}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paypal-navy/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-modal ${wide ? "max-w-4xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-paypal-dark">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ title, value, icon, tone = "blue" }: { title: string; value: string | number; icon: ReactNode; tone?: "blue" | "green" | "amber" | "dark" }) {
  const tones = {
    blue: "bg-paypal-blue text-white",
    green: "bg-emerald-500 text-white",
    amber: "bg-amber-400 text-white",
    dark: "bg-paypal-dark text-white",
  };
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-extrabold text-paypal-dark">{value}</p>
      </div>
    </Card>
  );
}

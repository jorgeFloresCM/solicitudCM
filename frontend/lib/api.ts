export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Opciones = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit | null };

/** Cliente de la API. Rutas relativas a /api (Next las reenvía al backend). */
export async function api<T = unknown>(path: string, opts: Opciones = {}): Promise<T> {
  const { json, ...init } = opts;
  const headers = new Headers(init.headers);
  let body = init.body;
  if (json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(json);
  }

  const res = await fetch(`/api${path}`, { ...init, headers, body, credentials: "same-origin" });

  // Sesión vencida → volver al login (salvo en el propio login)
  if (res.status === 401 && path !== "/auth/login" && typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.href = "/";
  }

  if (!res.ok) {
    let msg = "Ocurrió un error. Inténtalo nuevamente.";
    try {
      const d = await res.json();
      if (Array.isArray(d.message)) {
        // Los mensajes propios del backend empiezan en mayúscula; los de validación automática, no
        const propios = d.message.filter((m: string) => /^[A-ZÁÉÍÓÚÑ]/.test(m));
        msg = propios.length ? propios.join(". ") : "Datos inválidos. Revisa el formulario.";
      } else if (typeof d.message === "string") {
        msg = d.message;
      }
    } catch {
      /* respuesta sin JSON */
    }
    throw new ApiError(res.status, msg);
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const mensajeError = (e: unknown) => (e instanceof Error ? e.message : "Ocurrió un error.");

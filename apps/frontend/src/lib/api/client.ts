// Server-side fetches (inside the frontend container) must reach the backend via the Compose
// service name; browser-side fetches must use the host-mapped port. Picking based on
// `typeof window` is what keeps one API_BASE_URL constant from breaking one side or the other.
function resolveBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL_INTERNAL ?? "http://backend:8000/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

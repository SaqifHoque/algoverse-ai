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
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      `Cannot reach the local AlgoVerse backend at ${baseUrl}. Start it with “make dev”, then confirm Ollama is running. (${error instanceof Error ? error.message : String(error)})`,
      0,
    );
  }
  if (!res.ok) {
    const raw = await res.text().catch(() => res.statusText);
    // FastAPI's HTTPException body is {"detail": "..."} -- surface just the message rather
    // than the raw JSON blob on-screen.
    let detail = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") detail = parsed.detail;
    } catch {
      // not JSON, fall through to the raw text
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

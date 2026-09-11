import * as Device from "expo-device";
import { Platform } from "react-native";

import { useSettingsStore } from "@/stores/settingsStore";

export class NoBackendUrlConfiguredError extends Error {
  constructor() {
    super("No backend URL configured. Set it in Settings.");
    this.name = "NoBackendUrlConfiguredError";
  }
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

/** Simulator/emulator can reach the dev machine at a fixed address; a physical device cannot
 * guess it (there is no "localhost" equivalent across a LAN) -- it must be configured in
 * Settings, and we deliberately throw rather than silently trying a default that would just
 * time out with a confusing error. */
function platformDefaultBaseUrl(): string | null {
  const envDefault = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envDefault) return envDefault;

  if (Device.isDevice) return null;

  if (Platform.OS === "android") return "http://10.0.2.2:8000/api/v1"; // Android emulator alias for host loopback
  return "http://localhost:8000/api/v1"; // iOS simulator shares the host's loopback
}

export function resolveBaseUrl(): string {
  const override = useSettingsStore.getState().backendBaseUrl;
  if (override) return override;

  const fallback = platformDefaultBaseUrl();
  if (!fallback) throw new NoBackendUrlConfiguredError();
  return fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = resolveBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => res.statusText);
    let detail = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") detail = parsed.detail;
    } catch {
      // not JSON, fall through to raw text
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

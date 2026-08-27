import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  backendBaseUrl: string;
  useFixturesOverride: boolean | null;
  actions: {
    setBackendBaseUrl: (url: string) => void;
    resetToDefault: () => void;
    setUseFixturesOverride: (value: boolean | null) => void;
  };
}

// Persisted via AsyncStorage so the backend URL (which differs per network/machine -- there's
// no equivalent of the web app always being able to reach "localhost") survives app restarts.
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      backendBaseUrl: "",
      useFixturesOverride: null,
      actions: {
        setBackendBaseUrl: (url) => set({ backendBaseUrl: url.trim() }),
        resetToDefault: () => set({ backendBaseUrl: "" }),
        setUseFixturesOverride: (value) => set({ useFixturesOverride: value }),
      },
    }),
    {
      name: "algoverse-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        backendBaseUrl: state.backendBaseUrl,
        useFixturesOverride: state.useFixturesOverride,
      }),
    },
  ),
);

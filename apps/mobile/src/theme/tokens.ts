// RN equivalent of the web app's styles/tokens.css -- React Native has no CSS custom
// properties, so this is a plain object instead of :root/.dark CSS variables.
export interface Theme {
  name: "light" | "dark";
  surface: string;
  surfaceGlass: string;
  foreground: string;
  foregroundMuted: string;
  foregroundFaint: string;
  borderGlass: string;
  accent: string;
  accent2: string;
  compare: string;
  swap: string;
  push: string;
  pop: string;
  radiusLg: number;
  shadow: {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
  };
}

export const lightTheme: Theme = {
  name: "light",
  surface: "rgb(255, 255, 255)",
  surfaceGlass: "rgba(255, 255, 255, 0.6)",
  foreground: "rgb(15, 15, 20)",
  foregroundMuted: "rgba(15, 15, 20, 0.5)",
  foregroundFaint: "rgba(15, 15, 20, 0.35)",
  borderGlass: "rgba(15, 15, 20, 0.12)",
  accent: "rgb(99, 102, 241)",
  accent2: "rgb(236, 72, 153)",
  compare: "rgb(250, 204, 21)",
  swap: "rgb(236, 72, 153)",
  push: "rgb(52, 211, 153)",
  pop: "rgb(248, 113, 113)",
  radiusLg: 20,
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
};

export const darkTheme: Theme = {
  name: "dark",
  surface: "rgb(17, 17, 22)",
  surfaceGlass: "rgba(24, 24, 30, 0.65)",
  foreground: "rgb(237, 237, 242)",
  foregroundMuted: "rgba(237, 237, 242, 0.55)",
  foregroundFaint: "rgba(237, 237, 242, 0.35)",
  borderGlass: "rgba(255, 255, 255, 0.1)",
  accent: "rgb(129, 132, 255)",
  accent2: "rgb(236, 72, 153)",
  compare: "rgb(250, 204, 21)",
  swap: "rgb(236, 72, 153)",
  push: "rgb(52, 211, 153)",
  pop: "rgb(248, 113, 113)",
  radiusLg: 20,
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
  },
};

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BackgroundTheme = "dark" | "purple";

type BackgroundThemeState = {
	theme: BackgroundTheme;
	setTheme: (theme: BackgroundTheme) => void;
	toggle: () => void;
};

/**
 * Global background-theme preference (persisted to localStorage). "dark" is the
 * studio look; "purple" restores the original bright gradient. Only affects the
 * background — the rest of the UI stays dark-glass either way.
 */
export const useBackgroundTheme = create<BackgroundThemeState>()(
	persist(
		(set, get) => ({
			theme: "dark",
			setTheme: (theme) => set({ theme }),
			toggle: () => set({ theme: get().theme === "dark" ? "purple" : "dark" }),
		}),
		{ name: "openslop-bg-theme" },
	),
);

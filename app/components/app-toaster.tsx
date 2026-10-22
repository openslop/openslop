"use client";

import type { CSSProperties } from "react";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

const popoverSurface = {
	"--normal-bg": "var(--popover)",
	"--normal-border": "var(--border)",
	"--normal-text": "var(--popover-foreground)",
	"--border-radius": "var(--radius-xl)",
} as CSSProperties;

export function AppToaster() {
	const { resolvedTheme } = useTheme();
	return (
		<Toaster
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			position="bottom-center"
			richColors
			style={popoverSurface}
			toastOptions={{
				classNames: {
					toast: "data-[styled=true]:shadow-elevation-5!",
					content: "max-h-[40vh] flex-1 overflow-y-auto",
				},
			}}
		/>
	);
}

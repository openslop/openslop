"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function AppToaster() {
	const { resolvedTheme } = useTheme();
	return (
		<Toaster
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			position="bottom-center"
			richColors
		/>
	);
}

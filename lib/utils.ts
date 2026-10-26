import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom @theme font-size and font-weight tokens so tailwind-merge
// resolves conflicts on them. Otherwise it strips e.g. `text-label-xs` when a
// class string also sets a text color (`text-muted-foreground`), and keeps both
// `font-medium` and `font-book`, leaving the winner to stylesheet order.
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				{
					text: [
						"badge-xs",
						"badge",
						"label-xs",
						"label",
						"body",
						"body-lg",
						"heading-sm",
						"heading",
						"heading-lg",
						"display",
						"hero",
					],
				},
			],
			"font-weight": [{ font: ["book"] }],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

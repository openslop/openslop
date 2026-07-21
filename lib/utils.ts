import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the custom @theme font-size tokens so tailwind-merge treats them as
// font-sizes, not text-colors. Otherwise it strips e.g. `text-label-xs` when a
// class string also sets a text color (`text-muted-foreground`), since it can't
// tell the token apart from a color.
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
					],
				},
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

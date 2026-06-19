import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Constrain `n` to the inclusive range [min, max]. */
export function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

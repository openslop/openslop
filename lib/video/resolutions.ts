import { BASE_HEIGHT } from "./types";

export const RESOLUTIONS = [
	{ label: "480p", height: 480 },
	{ label: "720p", height: 720 },
	{ label: "1080p", height: 1080 },
	{ label: "1440p", height: 1440 },
	{ label: "4K", height: 2160 },
] as const;

export const scaleForHeight = (height: number) => height / BASE_HEIGHT;

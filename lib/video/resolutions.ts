import { BASE_WIDTH } from "./types";

export const RESOLUTIONS = [
	{ label: "480p", width: 854, height: 480 },
	{ label: "720p", width: 1280, height: 720 },
	{ label: "1080p", width: 1920, height: 1080 },
	{ label: "1440p", width: 2560, height: 1440 },
	{ label: "4K", width: 3840, height: 2160 },
] as const;

export const scaleForWidth = (width: number) => width / BASE_WIDTH;

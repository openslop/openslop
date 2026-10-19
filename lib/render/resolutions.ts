import { BASE_WIDTH } from "./types";

export const RESOLUTIONS = ["480p", "720p", "1080p", "1440p", "4K"] as const;

export type Resolution = (typeof RESOLUTIONS)[number];

const OUTPUT_WIDTHS: Record<Resolution, number> = {
	"480p": 854,
	"720p": 1280,
	"1080p": 1920,
	"1440p": 2560,
	"4K": 3840,
};

export const renderScale = (resolution: Resolution): number =>
	OUTPUT_WIDTHS[resolution] / BASE_WIDTH;

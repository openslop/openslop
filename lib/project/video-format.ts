export const VIDEO_FORMAT_TARGETS = [
	"cinematic",
	"faceless",
	"explainer",
] as const;

/** `auto` is a choice, not an absence: the writer picks the format that fits the brief. */
export const VIDEO_FORMAT_CHOICES = ["auto", ...VIDEO_FORMAT_TARGETS] as const;

export type VideoFormatTarget = (typeof VIDEO_FORMAT_TARGETS)[number];
export type VideoFormat = (typeof VIDEO_FORMAT_CHOICES)[number];

export const DEFAULT_VIDEO_FORMAT: VideoFormat = "auto";

export type VideoFormatSpec = {
	label: string;
	/** One sentence for the user, next to the choice. The writer's rules live in the script prompt. */
	summary: string;
};

export const VIDEO_FORMAT_SPECS = {
	cinematic: {
		label: "Cinematic",
		summary:
			"Visuals and music tell the story, and characters speak on screen. For films, anime, trailers and music videos.",
	},
	faceless: {
		label: "Faceless",
		summary:
			"A narrator and character voices tell the story over pictures and video. For stories read aloud, newscasts and podcasts.",
	},
	explainer: {
		label: "Explainer",
		summary:
			"A voice over video in which nobody speaks. For explainers, essays, lessons, documentaries and product tours.",
	},
} as const satisfies Record<VideoFormatTarget, VideoFormatSpec>;

const AUTO_SUMMARY = "Sloppy picks the format that fits your brief.";

export const videoFormatLabel = (format: VideoFormat): string =>
	format === "auto" ? "Auto" : VIDEO_FORMAT_SPECS[format].label;

export const videoFormatSummary = (format: VideoFormat): string =>
	format === "auto" ? AUTO_SUMMARY : VIDEO_FORMAT_SPECS[format].summary;

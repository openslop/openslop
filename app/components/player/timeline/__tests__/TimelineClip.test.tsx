import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ResolvedElement } from "@/lib/render/types";
import { TimelineClip } from "../TimelineClip";

const videoElement = (trimToDialogue: boolean): ResolvedElement => ({
	id: "video",
	type: "video",
	role: "foreground",
	layer: "visual",
	sceneId: "s1",
	sceneNumber: 1,
	prompt: "slow pan",
	url: "https://vid/a.mp4",
	durationSec: 5,
	loops: 1,
	loop: false,
	trimToDialogue,
	volume: 5,
	motion: "none",
});

const render = (element: ResolvedElement, sceneNumber?: number) =>
	renderToStaticMarkup(
		<TooltipProvider>
			<TimelineClip
				clip={{ key: "clip", element, start: 0, duration: 5 }}
				width={120}
				label="slow pan"
				selected={false}
				sceneNumber={sceneNumber}
			/>
		</TooltipProvider>,
	);

describe("TimelineClip timing badge", () => {
	const name = (html: string) => html.match(/aria-label="([^"]*)"/)?.[1];

	it("names a scene's clip as trimmed to its dialogue", () => {
		expect(name(render(videoElement(true), 1))).toBe(
			"Scene 1, Video, 0:00–0:05, Trim to dialogue",
		);
	});

	it("names a scene's clip as playing in full", () => {
		expect(name(render(videoElement(false), 1))).toContain("Play in full");
	});

	it("says nothing about timing on a clip that is not a scene", () => {
		expect(name(render(videoElement(true)))).toBe("Video, 0:00–0:05");
	});
});

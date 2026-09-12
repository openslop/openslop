import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ResolvedElement } from "@/lib/video/types";
import { TimelineClip } from "../TimelineClip";

const clip = (trimToDialogue: boolean): ResolvedElement => ({
	id: "clip",
	type: "clip",
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
		expect(name(render(clip(true), 1))).toBe(
			"Scene 1, Clip, 0:00–0:05, Trim to dialogue",
		);
	});

	it("names a scene's clip as playing in full", () => {
		expect(name(render(clip(false), 1))).toContain("Play in full");
	});

	it("says nothing about timing on a clip that is not a scene", () => {
		expect(name(render(clip(true)))).toBe("Clip, 0:00–0:05");
	});
});

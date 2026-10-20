import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ResolvedElement } from "@/lib/render/types";
import { TimelineClip } from "../timeline-clip";

const PX_PER_SEC = 10;

const element = (over: Partial<ResolvedElement> = {}): ResolvedElement => ({
	id: "video",
	type: "video",
	role: "foreground",
	layer: "visual",
	sceneId: "s1",
	sceneNumber: 1,
	prompt: "slow pan",
	url: "https://vid/a.mp4",
	durationSec: 5,
	mediaDurationSec: 5,
	trimStartSec: 0,
	loops: 1,
	loop: false,
	volume: 5,
	motion: "none",
	...over,
});

const name = (el: ResolvedElement, duration: number, trim = el) =>
	renderToStaticMarkup(
		<TimelineClip
			clip={{ key: "clip", element: el, start: 0, duration }}
			width={duration * PX_PER_SEC}
			label="slow pan"
			selected={false}
			pxPerSec={PX_PER_SEC}
			trim={trim}
		/>,
	).match(/aria-label="([^"]*)"/)?.[1];

describe("TimelineClip past its media", () => {
	it("says nothing while the media covers the clip", () => {
		expect(name(element(), 5)).toBe("Video, 0:00–0:05");
	});

	it("names what fills a clip that outlasts its media", () => {
		expect(name(element(), 8)).toBe(
			"Video, 0:00–0:08, Freeze on last frame after 0:05",
		);
		expect(name(element({ loop: true }), 8)).toContain("Loop after 0:05");
	});

	it("marks a video dragged past its media", () => {
		const video = element();
		expect(name(video, 8, { ...video, durationSec: 8 })).toContain(
			"Freeze on last frame",
		);
	});

	it("never marks a still, which has no media length", () => {
		const still = element({
			type: "image",
			mediaDurationSec: 0,
			durationSec: 0,
		});
		expect(name(still, 8)).toBe("Image, 0:00–0:08");
	});
});

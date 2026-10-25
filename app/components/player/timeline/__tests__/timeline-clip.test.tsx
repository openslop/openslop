import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Trim } from "@/lib/render/clip-trim";
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
	captioned: false,
	...over,
});

const markup = (el: ResolvedElement, duration: number, trim: Trim = el) =>
	renderToStaticMarkup(
		<TimelineClip
			clip={{ key: "clip", element: el, start: 0, duration }}
			width={duration * PX_PER_SEC}
			label="slow pan"
			selected={false}
			pxPerSec={PX_PER_SEC}
			trim={trim}
		/>,
	);

const sources = (el: ResolvedElement, duration: number, trim: Trim = el) =>
	[...markup(el, duration, trim).matchAll(/<video src="([^"]*)"/g)].map(
		([, src]) => src,
	);

describe("TimelineClip footage", () => {
	it("draws the footage once while the media covers the clip", () => {
		expect(sources(element(), 5)).toEqual(["https://vid/a.mp4"]);
	});

	it("holds the frame a frozen clip ends on", () => {
		expect(sources(element({ trimStartSec: 1, durationSec: 4 }), 8)).toEqual([
			"https://vid/a.mp4#t=1",
			"https://vid/a.mp4#t=5",
		]);
	});

	it("restarts the footage at its trim start each time a looping clip does", () => {
		expect(
			sources(element({ loop: true, trimStartSec: 1, durationSec: 4 }), 12),
		).toEqual(Array(3).fill("https://vid/a.mp4#t=1"));
	});

	it("draws from the committed trim while a drag previews another", () => {
		expect(
			sources(element(), 8, {
				trimStartSec: 0.30000000000000004,
				durationSec: 7.7,
			}),
		).toEqual(["https://vid/a.mp4", "https://vid/a.mp4#t=5"]);
	});

	it("draws a still once, since it has no media length", () => {
		const still = element({
			type: "image",
			mediaDurationSec: 0,
			durationSec: 0,
		});
		expect(markup(still, 8).match(/<img /g)).toHaveLength(1);
	});
});

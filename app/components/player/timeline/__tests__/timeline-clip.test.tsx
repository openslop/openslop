import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Trim } from "@/lib/render/clip-trim";
import type { ResolvedElement } from "@/lib/render/types";
import { TimelineClip, TimelineHold } from "../timeline-clip";

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

const sources = (markup: string) =>
	[...markup.matchAll(/<video src="([^"]*)"/g)].map(([, src]) => src);

describe("TimelineClip footage", () => {
	it("draws the footage once, from its in-point", () => {
		expect(sources(markup(element(), 5))).toEqual(["https://vid/a.mp4"]);
		expect(sources(markup(element({ trimStartSec: 1 }), 5))).toEqual([
			"https://vid/a.mp4#t=1",
		]);
	});

	it("draws from the committed trim while a drag previews another", () => {
		expect(
			sources(
				markup(element(), 8, {
					trimStartSec: 0.30000000000000004,
					durationSec: 7.7,
				}),
			),
		).toEqual(["https://vid/a.mp4"]);
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

const hold = (el: ResolvedElement, playedSec: number, duration: number) =>
	renderToStaticMarkup(
		<TimelineHold
			element={el}
			start={playedSec}
			duration={duration}
			playedWidth={playedSec * PX_PER_SEC}
			width={duration * PX_PER_SEC}
			selected={false}
		/>,
	);

describe("TimelineHold", () => {
	it("holds the frame a frozen clip ends on", () => {
		const html = hold(element({ trimStartSec: 1, durationSec: 4 }), 4, 4);
		expect(sources(html)).toEqual(["https://vid/a.mp4#t=5"]);
		expect(html).toContain('aria-label="Freeze on last frame, 0:04–0:08"');
	});

	it("restarts the footage at its trim start each time a looping clip does", () => {
		const html = hold(
			element({ loop: true, trimStartSec: 1, durationSec: 4 }),
			4,
			8,
		);
		expect(sources(html)).toEqual(Array(2).fill("https://vid/a.mp4#t=1"));
		expect(html).toContain('aria-label="Loop, 0:04–0:12"');
	});

	it("fills a partial last pass rather than leaving the band short", () => {
		const clip = element({ loop: true, durationSec: 5 });
		expect(sources(hold(clip, 5, 7))).toHaveLength(2);
	});
});

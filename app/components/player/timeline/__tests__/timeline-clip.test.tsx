import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Trim } from "@/lib/render/clip-trim";
import type { ResolvedElement } from "@/lib/render/types";
import { TimelineClip, TimelineExtension } from "../timeline-clip";

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
	timelineDurationSec: 5,
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
					timelineDurationSec: 7.7,
				}),
			),
		).toEqual(["https://vid/a.mp4"]);
	});

	it("draws a still once, since it has no media length", () => {
		const still = element({
			type: "image",
			mediaDurationSec: 0,
			timelineDurationSec: 0,
		});
		expect(markup(still, 8).match(/<img /g)).toHaveLength(1);
	});
});

const extension = (el: ResolvedElement, start: number, duration: number) =>
	renderToStaticMarkup(
		<TimelineExtension
			element={el}
			start={start}
			duration={duration}
			clipWidth={start * PX_PER_SEC}
			width={duration * PX_PER_SEC}
			selected={false}
		/>,
	);

describe("TimelineExtension", () => {
	it("freezes on the frame the trimmed clip ends on", () => {
		const html = extension(
			element({
				trimStartSec: 1,
				timelineDurationSec: 3,
				mediaDurationSec: 10,
			}),
			3,
			4,
		);
		expect(sources(html)).toEqual(["https://vid/a.mp4#t=4"]);
		expect(html).toContain('aria-label="Freeze on last frame, 0:03–0:07"');
	});

	it("restarts the footage at its trim start each pass, filling a partial last one", () => {
		const html = extension(
			element({ loop: true, trimStartSec: 1, timelineDurationSec: 4 }),
			4,
			6,
		);
		expect(sources(html)).toEqual(Array(2).fill("https://vid/a.mp4#t=1"));
		expect(html).toContain('aria-label="Loop, 0:04–0:10"');
	});
});

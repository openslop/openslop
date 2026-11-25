import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { noHistory } from "@/app/components/canvas/__tests__/_mount";
import {
	GenerationQueueProvider,
	useGenerationQueue,
} from "@/lib/generation/generation-queue-provider";
import {
	EMPTY_SNAPSHOT,
	type GenerationStatus,
} from "@/lib/generation/snapshots";
import type { ResolvedElement, Trim } from "@/lib/render/types";
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
	trimDurationSec: 5,
	mediaDurationSec: 5,
	trimStartSec: 0,
	loops: 1,
	loop: false,
	volume: 5,
	motion: "none",
	...over,
});

/** Reports the status the queue holds for every element, as a regeneration under way would. */
function HoldStatus({ status }: { status: GenerationStatus }) {
	const queue = useGenerationQueue();
	vi.spyOn(queue, "getElementSnapshot").mockReturnValue({
		...EMPTY_SNAPSHOT,
		status,
		startedAt: status === "generating" ? 0 : null,
	});
	return null;
}

const markup = (
	el: ResolvedElement,
	duration: number,
	{
		trim = el,
		status = "idle",
		sceneNumber,
	}: { trim?: Trim; status?: GenerationStatus; sceneNumber?: number } = {},
) =>
	renderToStaticMarkup(
		<TooltipProvider>
			<GenerationQueueProvider initialState={{}} storage={noHistory}>
				<HoldStatus status={status} />
				<TimelineClip
					clip={{
						key: "clip",
						element: el,
						start: 0,
						duration,
						minDuration: 0,
					}}
					width={duration * PX_PER_SEC}
					label="slow pan"
					selected={false}
					sceneNumber={sceneNumber}
					pxPerSec={PX_PER_SEC}
					trim={trim}
				/>
			</GenerationQueueProvider>
		</TooltipProvider>,
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
					trim: { trimStartSec: 0.30000000000000004, trimDurationSec: 7.7 },
				}),
			),
		).toEqual(["https://vid/a.mp4"]);
	});

	it("draws a still once, since it has no media length", () => {
		const still = element({
			type: "image",
			mediaDurationSec: 0,
			trimDurationSec: 0,
		});
		expect(markup(still, 8).match(/<img /g)).toHaveLength(1);
	});
});

const SHIMMER = /data-slot="skeleton"[^>]*aria-hidden/;

describe("TimelineClip regeneration", () => {
	it("shows no indicator while the element is idle", () => {
		const html = markup(element(), 5);
		expect(html).not.toContain('role="status"');
		expect(html).not.toContain("regenerating");
		expect(html).not.toMatch(SHIMMER);
	});

	it.each([
		["queued", "Queued…", false],
		["generating", "Generating 0s", true],
	] as const)("marks a clip whose element is %s", (status, label, shimmers) => {
		const html = markup(element(), 5, { status });
		expect(html).toContain(`role="status" aria-label="${label}"`);
		expect(html).toContain('aria-label="Video, regenerating, 0:00–0:05"');
		expect(SHIMMER.test(html)).toBe(shimmers);
	});

	it("names the scene before the regenerating clip", () => {
		const html = markup(element(), 5, { status: "generating", sceneNumber: 1 });
		expect(html).toContain(
			'aria-label="Scene 1, Video, regenerating, 0:00–0:05"',
		);
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
				trimDurationSec: 3,
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
			element({ loop: true, trimStartSec: 1, trimDurationSec: 4 }),
			4,
			6,
		);
		expect(sources(html)).toEqual(Array(2).fill("https://vid/a.mp4#t=1"));
		expect(html).toContain('aria-label="Loop, 0:04–0:10"');
	});
});

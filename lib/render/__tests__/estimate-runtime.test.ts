import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { estimateSpeechSec } from "@/lib/project/video-length";
import type { TransitionType } from "../transitions";
import { estimateRuntime } from "../estimate-runtime";
import { layoutOf } from "./_layout";
import { element, scene, words } from "./_script";

const runtime = (
	script: Descendant[],
	transitionType: TransitionType = "none",
) =>
	estimateRuntime(script, {
		...VideoSettingsSchema.parse({}),
		transitionType,
	});

describe("estimateRuntime", () => {
	it("adds up every visual's time on screen, not just the speech over it", () => {
		expect(
			runtime([
				scene(
					element("video", "A fox runs.", { duration: "10" }),
					element("video", "It stops.", { duration: "8" }),
				),
			]),
		).toBe(18);
	});

	it("holds a video for its trim, or longer for the dialogue after it", () => {
		expect(
			runtime([
				scene(
					element("video", "A pan.", { duration: "8", trimEnd: "5" }),
					element("narration", words(9)),
					element("video", "A zoom.", { duration: "4" }),
					element("narration", words(90)),
				),
			]),
		).toBe(5 + estimateSpeechSec(90));
	});

	it("holds a still for the dialogue after it, and at least a second", () => {
		expect(
			runtime([
				scene(
					element("image", "A forest."),
					element("narration", words(90)),
					element("image", "A clearing."),
					element("music", "Soft piano."),
				),
			]),
		).toBe(estimateSpeechSec(90) + 1);
	});

	it("counts dialogue before the first visual, which plays over a blank scene", () => {
		expect(
			runtime([
				scene(element("narration", words(180)), element("image", "A forest.")),
			]),
		).toBe(estimateSpeechSec(180) + 1);
	});

	it("overlaps each scene after the first by the transition the layout snaps to frames", () => {
		const script = [
			scene(element("narration", words(30))),
			scene(element("image", "A forest."), element("image", "A river.")),
		];

		expect(runtime(script, "fade")).toBeCloseTo(
			runtime(script) -
				2 * layoutOf([], { transitionType: "fade" }).transitionDurationSec,
		);
	});

	it("estimates a narration-only script by its speech", () => {
		expect(runtime([scene(element("narration", words(90)))])).toBe(
			estimateSpeechSec(90),
		);
	});

	it("estimates an empty canvas as nothing", () => {
		expect(runtime([])).toBe(0);
	});
});

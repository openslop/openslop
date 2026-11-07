import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import type { ContentType } from "@/lib/canvas/types";
import { measureRuntime, measureVisualSpans } from "../visual-spans";
import type { ResolvedElement } from "../types";
import { CONTENT_TYPES } from "@/lib/canvas/types";
import { secondsForWords } from "@/lib/project/video-length";
import { layoutOf } from "./_layout";
import { totalDuration } from "../sequences";
import { transitionOverlapSec } from "../transitions";
import { splitAttributes } from "@/lib/canvas/element-attributes";

let nextId = 0;
const element = (
	type: ContentType,
	text: string,
	attributes: Record<string, string> = {},
) => {
	const id = `e${nextId++}`;
	return {
		id,
		type,
		...splitAttributes(attributes),
		children: [{ id: `${id}-t`, text }],
	};
};

const scene = (...children: ReturnType<typeof element>[]): Descendant =>
	({ id: `s${nextId++}`, type: "scene", children }) as unknown as Descendant;

const words = (count: number) => Array(count).fill("word").join(" ");

describe("measureVisualSpans", () => {
	it("holds a still for the dialogue that follows it, up to the next visual", () => {
		const image = element("image", "A forest.");
		const narration = element("narration", words(90));
		const next = element("image", "A clearing.");

		const [first, second] = measureVisualSpans([
			scene(image, narration, next, element("narration", words(180))),
		]);

		expect(first).toMatchObject({
			id: image.id,
			seconds: 30,
			words: 90,
			dialogueIds: [narration.id],
		});
		expect(second.seconds).toBe(60);
	});

	it("counts dialogue across scene boundaries, since only a visual ends a span", () => {
		const image = element("image", "A forest.");

		const [only] = measureVisualSpans([
			scene(image, element("narration", words(90))),
			scene(element("character", words(90))),
		]);

		expect(only).toMatchObject({ seconds: 60, words: 180, sceneNumber: 1 });
	});

	it("holds a video for its generated length, or longer for the dialogue after it", () => {
		const [held, extended] = measureVisualSpans([
			scene(
				element("video", "A pan.", { duration: "8" }),
				element("narration", words(9)),
				element("video", "A zoom.", { duration: "4" }),
				element("narration", words(90)),
			),
		]);

		expect(held.seconds).toBe(8);
		expect(extended.seconds).toBe(30);
	});

	it("holds a trimmed video for its trimmed length", () => {
		const [cut, opened] = measureVisualSpans([
			scene(
				element("video", "A pan.", { duration: "8", trimEnd: "5" }),
				element("video", "A zoom.", { duration: "8", trimStart: "3" }),
			),
		]);

		expect(cut).toMatchObject({ seconds: 5, durationSec: 8 });
		expect(opened.seconds).toBe(5);
	});

	it("lets dialogue run past a trim", () => {
		const [held] = measureVisualSpans([
			scene(
				element("video", "A pan.", { duration: "8", trimEnd: "5" }),
				element("narration", words(90)),
			),
		]);

		expect(held.seconds).toBe(30);
	});

	it("ignores silent elements and dialogue before the first visual", () => {
		const image = element("image", "A forest.");

		const lengths = measureVisualSpans([
			scene(
				element("narration", words(180)),
				image,
				element("music", "Soft piano."),
				element("sound", "Wind"),
			),
		]);

		expect(lengths).toHaveLength(1);
		expect(lengths[0]).toMatchObject({ id: image.id, words: 0, seconds: 1 });
	});

	it("measures an empty canvas as nothing", () => {
		expect(measureVisualSpans([])).toEqual([]);
	});
});

describe("measureRuntime", () => {
	it("adds up every visual's time on screen, not just the speech over it", () => {
		const runtime = measureRuntime(
			[
				scene(
					element("video", "A fox runs.", { duration: "10" }),
					element("video", "It stops.", { duration: "8" }),
				),
			],
			"none",
		);

		expect(runtime).toBe(18);
	});

	it("counts dialogue before the first visual, which plays over a blank scene", () => {
		const runtime = measureRuntime(
			[scene(element("narration", words(180)), element("image", "A forest."))],
			"none",
		);

		expect(runtime).toBe(secondsForWords(180) + 1);
	});

	it("overlaps each scene after the first by the transition", () => {
		const script = [
			scene(element("narration", words(30))),
			scene(element("image", "A forest."), element("image", "A river.")),
		];

		expect(measureRuntime(script, "fade")).toBeCloseTo(
			measureRuntime(script, "none") - 2 * transitionOverlapSec("fade"),
		);
	});

	it("measures a narration-only script by its speech", () => {
		expect(
			measureRuntime([scene(element("narration", words(90)))], "none"),
		).toBe(secondsForWords(90));
	});
});

/**
 * The estimate copies the scene-builder rule off the unrendered script, so the
 * two have to agree once every element is generated at the length it was set to.
 */
describe("against buildRenderLayout", () => {
	const resolved = (
		node: ReturnType<typeof element>,
		mediaDurationSec: number,
	): ResolvedElement => {
		const spec = CONTENT_TYPES[node.type];
		return {
			id: node.id,
			type: node.type,
			role: spec.role,
			layer: spec.layer,
			sceneId: "s",
			sceneNumber: 1,
			prompt: "",
			url: `https://example.com/${node.id}`,
			trimStartSec: 0,
			trimDurationSec: mediaDurationSec,
			mediaDurationSec,
			loops: 1,
			loop: false,
			volume: 10,
			motion: "none",
		};
	};

	const opening = element("narration", words(15));
	const still = element("image", "A forest.");
	const line = element("narration", words(90));
	const held = element("video", "A pan.", { duration: "4" });
	const heldLine = element("character", words(30));
	const whole = element("video", "A zoom.", { duration: "8" });
	const shortLine = element("character", words(6));
	const script = [
		scene(opening, still, line),
		scene(held, heldLine, element("music", "Soft piano.")),
		scene(whole, shortLine),
	];
	const layout = layoutOf(
		[
			resolved(opening, secondsForWords(15)),
			resolved(still, 0),
			resolved(line, secondsForWords(90)),
			resolved(held, 4),
			resolved(heldLine, secondsForWords(30)),
			resolved(whole, 8),
			resolved(shortLine, secondsForWords(6)),
		],
		{ transitionType: "fade", fps: 25 },
	);

	it("estimates each visual's slot as the layout lays it down", () => {
		const [, ...visuals] = layout.series;
		const lengths = measureVisualSpans(script);

		expect(visuals.map(({ element: { id } }) => id)).toEqual(
			lengths.map(({ id }) => id),
		);
		visuals.forEach((sequence, i) =>
			expect(totalDuration(sequence)).toBeCloseTo(lengths[i].seconds),
		);
	});

	it("estimates the runtime the layout lays down", () => {
		expect(measureRuntime(script, "fade")).toBeCloseTo(layout.totalDurationSec);
	});
});

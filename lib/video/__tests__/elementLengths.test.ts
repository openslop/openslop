import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import type { CanvasElementType } from "@/lib/canvas/types";
import { measureElementLengths } from "../elementLengths";
import { buildVideoLayout } from "../scene-builder";
import type { ResolvedElement } from "../types";
import { ELEMENT_TYPES } from "@/lib/canvas/types";
import { secondsForWords } from "../videoLength";
import {
	getTrimToDialogue,
	splitAttributes,
} from "@/lib/video/elementAttributes";

let nextId = 0;
const element = (
	type: CanvasElementType,
	text: string,
	customAttributes?: Record<string, string>,
) => {
	const id = `e${nextId++}`;
	return {
		id,
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: `${id}-t`, type, text }],
	};
};

const scene = (...children: ReturnType<typeof element>[]): Descendant =>
	({ id: `s${nextId++}`, type: "scene", children }) as unknown as Descendant;

const words = (count: number) => Array(count).fill("word").join(" ");

describe("measureElementLengths", () => {
	it("holds a still for the dialogue that follows it, up to the next visual", () => {
		const image = element("image", "A forest.");
		const narration = element("narration", words(90));
		const next = element("image", "A clearing.");

		const [first, second] = measureElementLengths([
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

		const [only] = measureElementLengths([
			scene(image, element("narration", words(90))),
			scene(element("character", words(90))),
		]);

		expect(only).toMatchObject({ seconds: 60, words: 180, sceneNumber: 1 });
	});

	it("cuts a clip to the dialogue after it, whatever it was generated at", () => {
		const [cut, extended] = measureElementLengths([
			scene(
				element("clip", "A pan.", { duration: "8" }),
				element("narration", words(9)),
				element("clip", "A zoom.", { duration: "4" }),
				element("narration", words(90)),
			),
		]);

		expect(cut.seconds).toBe(3);
		expect(extended.seconds).toBe(30);
	});

	it("holds a clip for its generated length when it says not to trim", () => {
		const [held] = measureElementLengths([
			scene(
				element("clip", "A pan.", { duration: "8", trimToDialogue: "false" }),
				element("narration", words(9)),
			),
		]);

		expect(held.seconds).toBe(8);
	});

	// Trimming is each clip's own call, so two clips with the same dialogue
	// after them can measure differently on the same canvas.
	it("measures a trimmed and an untrimmed clip differently side by side", () => {
		const [cut, held] = measureElementLengths([
			scene(
				element("clip", "A pan.", { duration: "8" }),
				element("narration", words(9)),
				element("clip", "A zoom.", { duration: "8", trimToDialogue: "false" }),
				element("narration", words(9)),
			),
		]);

		expect(cut.seconds).toBe(3);
		expect(held.seconds).toBe(8);
	});

	it("lets dialogue extend an untrimmed clip past its generated length", () => {
		const [extended] = measureElementLengths([
			scene(
				element("clip", "A pan.", { duration: "4", trimToDialogue: "false" }),
				element("narration", words(90)),
			),
		]);

		expect(extended.seconds).toBe(30);
	});

	it("ignores silent elements and dialogue before the first visual", () => {
		const image = element("image", "A forest.");

		const lengths = measureElementLengths([
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
		expect(measureElementLengths([])).toEqual([]);
	});
});

/**
 * `measureElementLengths` mirrors the scene-builder rule off the unrendered
 * script, so the two have to agree once the assets exist. Nothing else enforces
 * that: the layout skips ungenerated elements, which is why the estimate exists.
 */
describe("against buildVideoLayout", () => {
	const resolved = (
		node: ReturnType<typeof element>,
		durationSec: number,
	): ResolvedElement => {
		const spec = ELEMENT_TYPES[node.type];
		return {
			id: node.id,
			type: node.type,
			role: spec.role,
			layer: spec.layer,
			sceneId: "s",
			sceneNumber: 1,
			prompt: "",
			url: `https://example.com/${node.id}`,
			durationSec,
			loops: 1,
			loop: false,
			trimToDialogue: getTrimToDialogue(node),
			volume: 10,
			motion: "none",
		};
	};

	it("estimates the same lengths the layout lays down", () => {
		const first = element("image", "A forest.");
		const line = element("narration", words(90));
		const second = element("clip", "A pan.", { duration: "8" });
		const shortLine = element("character", words(15));
		const third = element("clip", "A zoom.", {
			duration: "8",
			trimToDialogue: "false",
		});
		const lastLine = element("character", words(15));

		const lengths = measureElementLengths([
			scene(first, line),
			scene(second, shortLine, element("music", "Soft piano.")),
			scene(third, lastLine),
		]);
		const { series } = buildVideoLayout([
			resolved(first, 0),
			resolved(line, secondsForWords(90)),
			resolved(second, 8),
			resolved(shortLine, secondsForWords(15)),
			resolved(third, 8),
			resolved(lastLine, secondsForWords(15)),
		]);

		expect(series).toHaveLength(lengths.length);
		series.forEach((seq, i) => {
			expect(seq.element.id).toBe(lengths[i].id);
			expect(seq.duration).toBeCloseTo(lengths[i].seconds);
		});
	});
});

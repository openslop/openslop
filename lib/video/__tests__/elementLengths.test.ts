import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import type { CanvasElementType } from "@/lib/canvas/types";
import { measureElementLengths } from "../elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "../scene-builder";
import { splitAttributes } from "@/lib/video/elementAttributes";

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

const trimmed = (nodes: Descendant[]) =>
	measureElementLengths(nodes, DEFAULT_TRIM_VISUALS_TO_DIALOGUE);

describe("measureElementLengths", () => {
	it("holds a still for the dialogue that follows it, up to the next visual", () => {
		const image = element("image", "A forest.");
		const narration = element("narration", words(90));
		const next = element("image", "A clearing.");

		const [first, second] = trimmed([
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

		const [only] = trimmed([
			scene(image, element("narration", words(90))),
			scene(element("character", words(90))),
		]);

		expect(only).toMatchObject({ seconds: 60, words: 180, sceneNumber: 1 });
	});

	it("cuts a clip to the dialogue after it, whatever it was generated at", () => {
		const [cut, extended] = trimmed([
			scene(
				element("animated_image", "A pan.", { duration: "8" }),
				element("narration", words(9)),
				element("animated_image", "A zoom.", { duration: "4" }),
				element("narration", words(90)),
			),
		]);

		expect(cut.seconds).toBe(3);
		expect(extended.seconds).toBe(30);
	});

	it("holds a clip for its generated length when trimming is off", () => {
		const [held] = measureElementLengths(
			[
				scene(
					element("animated_image", "A pan.", { duration: "8" }),
					element("narration", words(9)),
				),
			],
			false,
		);

		expect(held.seconds).toBe(8);
	});

	it("ignores silent elements and dialogue before the first visual", () => {
		const image = element("image", "A forest.");

		const lengths = trimmed([
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
		expect(trimmed([])).toEqual([]);
	});
});

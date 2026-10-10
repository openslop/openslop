import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import type { ContentType } from "../types";
import { countSpokenWords } from "../spoken-words";

let nextId = 0;
const element = (type: ContentType, text: string) => {
	const id = `e${nextId++}`;
	return { id, type, children: [{ id: `${id}-t`, type, text }] };
};

const scene = (...children: ReturnType<typeof element>[]): Descendant =>
	({ id: `s${nextId++}`, type: "scene", children }) as unknown as Descendant;

describe("countSpokenWords", () => {
	it("counts narration and dialogue and nothing else", () => {
		const nodes = [
			scene(
				element("narration", "The sun was setting in the west."),
				element("character", "Truce?"),
				element("image", "A dark forest with a clearing in the center."),
				element("music", "Soft, slow, sad piano music."),
				element("sound", "Wind"),
			),
		];

		expect(countSpokenWords(nodes)).toBe(8);
	});

	it("counts across scenes", () => {
		const nodes = [
			scene(element("narration", "One two three.")),
			scene(element("character", "Four five.")),
		];

		expect(countSpokenWords(nodes)).toBe(5);
	});

	it("counts an empty canvas as zero", () => {
		expect(countSpokenWords([])).toBe(0);
		expect(countSpokenWords([scene(element("narration", "  "))])).toBe(0);
	});
});

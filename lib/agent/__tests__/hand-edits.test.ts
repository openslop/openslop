import { describe, expect, it } from "vitest";
import {
	SCENE_TYPE,
	type ContentElement,
	type Scene,
} from "@/lib/canvas/types";
import { asset, element } from "@/lib/canvas/__tests__/_assets";
import { describeHandEdits, diffCanvas } from "../hand-edits";

const scene = (id: string, ...children: ContentElement[]): Scene => ({
	id,
	type: SCENE_TYPE,
	children,
});

const line = (text: string) => element("n1", "narration", text);
const forest = element("i1", "image", "a forest");
const style = asset("asset_style", { text: "ink wash" });

describe("diffCanvas", () => {
	it("is null when the canvas reads the same", () => {
		const before = [style, scene("s1", line("Once upon a time"), forest)];
		const after = [style, scene("s1", line("Once upon a time"), forest)];

		expect(diffCanvas(before, after)).toBeNull();
	});

	it("pairs an element's text before and after, by its id", () => {
		const before = [scene("s1", line("Once upon a time"), forest)];
		const after = [scene("s1", line("Long ago"), forest)];

		expect(diffCanvas(before, after)).toEqual({
			changed: [
				{
					before: '<narration id="n1">Once upon a time</narration>',
					after: '<narration id="n1">Long ago</narration>',
				},
			],
			added: [],
			removed: [],
		});
	});

	it("reads an attribute change as a change to that element", () => {
		const before = [scene("s1", element("v1", "video", "a river"))];
		const after = [
			scene("s1", element("v1", "video", "a river", { duration: "10" })),
		];

		expect(diffCanvas(before, after)?.changed).toEqual([
			{
				before: '<video id="v1">a river</video>',
				after: '<video id="v1" duration="10">a river</video>',
			},
		]);
	});

	it("lists what was added and what was removed, assets included", () => {
		const before = [style, scene("s1", line("Once upon a time"))];
		const after = [scene("s1", line("Once upon a time"), forest)];

		expect(diffCanvas(before, after)).toEqual({
			changed: [],
			added: ['<image id="i1">a forest</image>'],
			removed: ['<asset_style id="' + style.id + '">ink wash</asset_style>'],
		});
	});

	it("ignores an element that only moved", () => {
		const before = [scene("s1", line("Once upon a time"), forest)];
		const after = [scene("s1", forest, line("Once upon a time"))];

		expect(diffCanvas(before, after)).toBeNull();
	});
});

describe("describeHandEdits", () => {
	it("lists the edits for the model, one line each", () => {
		const note = describeHandEdits({
			changed: [{ before: "<a>old</a>", after: "<a>new</a>" }],
			added: ["<b>fresh</b>"],
			removed: ["<c>gone</c>"],
		});

		expect(note).toBe(
			[
				"The user edited the canvas by hand since your last turn:",
				"- changed: <a>old</a>",
				"  to: <a>new</a>",
				"- added: <b>fresh</b>",
				"- removed: <c>gone</c>",
			].join("\n"),
		);
	});
});

import { describe, expect, it } from "vitest";
import { createCanvasElement } from "@/lib/canvas/createCanvasElement";
import { depend, read } from "../declare";
import { EMPTY_CONTEXT } from "./_context";

const image = createCanvasElement("image", {
	id: "img",
	attrs: { name: "Mia" },
});
const avatar = createCanvasElement("asset_avatar", { attrs: { name: "Mia" } });

describe("read", () => {
	const name = read(
		"the name",
		(element) => element.generationAttributes?.name,
	);

	it("records what it reads under its label", () => {
		expect(name(image, EMPTY_CONTEXT)).toEqual({ "the name": "Mia" });
	});

	it("reads back the value the inputs recorded, not what the canvas says now", () => {
		expect(name.value({ reads: { "the name": "Bob" } })).toBe("Bob");
		expect(name.value({})).toBeUndefined();
	});
});

describe("depend", () => {
	const mias = depend("Mia's avatar", () => avatar);

	it("declares the element it picks under its label", () => {
		expect(mias(image, EMPTY_CONTEXT)).toEqual({ "Mia's avatar": avatar });
	});

	it("reads back the result handed over under its label", () => {
		const result = { durationSec: 0, imageUrl: "https://img/mia.png" };

		expect(mias.result({ dependencies: { "Mia's avatar": result } })).toBe(
			result,
		);
		expect(mias.result({})).toBeUndefined();
	});
});

import { describe, expect, it } from "vitest";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import { isGenerated, type ScriptElement } from "@/lib/canvas/types";
import { dependency, reading } from "../dependency";
import { EMPTY_CONTEXT } from "./_context";

const named = (id: string, name: string): ScriptElement =>
	createCanvasNode("image", { id, attrs: { name } });

const mia = named("mia", "Mia");
const bob = named("bob", "Bob");
const ctx = { ...EMPTY_CONTEXT, canvas: [mia, bob] };

const bobs = dependency("Bob's", (_, { canvas }) =>
	canvas
		.filter(isGenerated)
		.find((element) => element.generationAttributes?.name === "Bob"),
);

describe("dependency", () => {
	it("declares the element it picks under its label, and nothing when it picks none", () => {
		expect(bobs.dependencies(mia, ctx)).toEqual({ "Bob's": bob });
		expect(bobs.dependencies(mia, { ...ctx, canvas: [mia] })).toEqual({});
	});

	it("reads back the result handed over under its label", () => {
		const result = { durationSec: 0, imageUrl: "https://img/bob.png" };

		expect(bobs.result({ dependencies: { "Bob's": result } })).toBe(result);
		expect(bobs.result({ dependencies: {} })).toBeUndefined();
	});
});

describe("reading", () => {
	const nameOf = reading(
		"the name",
		(element) => element.generationAttributes?.name,
	);

	it("records what it reads under its label, and nothing when there is nothing to read", () => {
		expect(nameOf.reads(mia, ctx)).toEqual({ "the name": "Mia" });
		expect(nameOf.reads(createCanvasNode("image", { id: "x" }), ctx)).toEqual(
			{},
		);
	});

	it("reads back the value its inputs recorded, not what the canvas says now", () => {
		const reads = nameOf.reads(mia, ctx);

		expect(nameOf.value({ reads })).toBe("Mia");
		expect(nameOf.value({ reads: { "the name": "Bob" } })).toBe("Bob");
		expect(nameOf.value({})).toBeUndefined();
	});
});

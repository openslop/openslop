import { describe, expect, it } from "vitest";
import { createCanvasNode } from "@/lib/canvas/createCanvasNode";
import type { ScriptElement } from "@/lib/canvas/types";
import { dependency, dependencyPerName, reading } from "../dependency";
import { EMPTY_CONTEXT } from "./_context";

const named = (id: string, name: string): ScriptElement =>
	createCanvasNode("image", { id, attrs: { name } });

const mia = named("mia", "Mia");
const bob = named("bob", "Bob");
const ctx = { ...EMPTY_CONTEXT, canvas: [mia, bob] };

const perName = dependencyPerName(
	() => ["Mia", "Ghost", "Bob"],
	(name) =>
		dependency(`of:${name}`, `${name}'s`, (_, { canvas }) =>
			canvas.find((element) => element.generationAttributes?.name === name),
		),
);

describe("dependencyPerName", () => {
	it("declares one edge per listed name that picks an element, keyed by that name", () => {
		expect(perName.edges(mia, ctx)).toEqual([
			["of:Mia", mia, "Mia's"],
			["of:Bob", bob, "Bob's"],
		]);
	});

	it("reads each result back by the name it was declared for", () => {
		const result = { durationSec: 0, imageUrl: "https://img/bob.png" };
		const dependencies = { "of:Bob": result };

		expect(perName.read("Bob", { dependencies })).toBe(result);
		expect(perName.read("Mia", { dependencies })).toBeUndefined();
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

import { describe, expect, it } from "vitest";
import { isStaleResult, serializeInputs } from "../generationInputs";
import type { GenerationInputs } from "../generationInputs";

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes });

describe("isStaleResult", () => {
	it("is false when no result has been produced", () => {
		expect(
			isStaleResult({ result: null, resultInputs: null }, inputs("anything")),
		).toBe(false);
	});

	it("is false when resultInputs is null even if a result exists", () => {
		expect(
			isStaleResult(
				{ result: { url: "x", durationSec: 0 }, resultInputs: null },
				inputs("anything"),
			),
		).toBe(false);
	});

	it("is false when prompts and attributes match", () => {
		const i = inputs("hello", { gender: "male" });
		expect(
			isStaleResult(
				{ result: { url: "x", durationSec: 0 }, resultInputs: i },
				inputs("hello", { gender: "male" }),
			),
		).toBe(false);
	});

	it("is true when prompt differs", () => {
		expect(
			isStaleResult(
				{
					result: { url: "x", durationSec: 0 },
					resultInputs: inputs("old prompt"),
				},
				inputs("new prompt"),
			),
		).toBe(true);
	});

	it("is true when attributes differ", () => {
		expect(
			isStaleResult(
				{
					result: { url: "x", durationSec: 0 },
					resultInputs: inputs("hi", { gender: "male" }),
				},
				inputs("hi", { gender: "female" }),
			),
		).toBe(true);
	});

	it("treats attribute key sets as equal regardless of insertion order", () => {
		expect(
			isStaleResult(
				{
					result: { url: "x", durationSec: 0 },
					resultInputs: inputs("hi", { a: "1", b: "2" }),
				},
				inputs("hi", { b: "2", a: "1" }),
			),
		).toBe(false);
	});

	it("is true when an attribute is added", () => {
		expect(
			isStaleResult(
				{
					result: { url: "x", durationSec: 0 },
					resultInputs: inputs("hi", { a: "1" }),
				},
				inputs("hi", { a: "1", b: "2" }),
			),
		).toBe(true);
	});
});

describe("serializeInputs", () => {
	it("produces a stable string for identical inputs", () => {
		const a = serializeInputs(inputs("hi", { gender: "male" }));
		const b = serializeInputs(inputs("hi", { gender: "male" }));
		expect(a).toBe(b);
	});

	it("produces different strings when prompts differ", () => {
		expect(serializeInputs(inputs("a"))).not.toBe(serializeInputs(inputs("b")));
	});

	it("produces different strings when attributes differ", () => {
		expect(serializeInputs(inputs("hi", { gender: "male" }))).not.toBe(
			serializeInputs(inputs("hi", { gender: "female" })),
		);
	});

	it("is stable regardless of attribute insertion order", () => {
		expect(serializeInputs(inputs("hi", { a: "1", b: "2" }))).toBe(
			serializeInputs(inputs("hi", { b: "2", a: "1" })),
		);
	});

	it("agrees with isStaleResult on equivalent inputs (no false cache miss)", () => {
		const stored = inputs("hi", { a: "1", b: "2", c: "3" });
		const lookedUp = inputs("hi", { c: "3", a: "1", b: "2" });
		expect(
			isStaleResult(
				{ result: { url: "x", durationSec: 0 }, resultInputs: stored },
				lookedUp,
			),
		).toBe(false);
		expect(serializeInputs(stored)).toBe(serializeInputs(lookedUp));
	});
});

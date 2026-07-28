import { describe, expect, it } from "vitest";
import { serializeInputs, type GenerationInputs } from "../inputs";
import { isStaleResult, type ElementSnapshot } from "../queue";

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes });

const snapshot = (
	overrides: Partial<ElementSnapshot> = {},
): ElementSnapshot => ({
	status: "idle",
	seconds: 0,
	result: null,
	error: null,
	resultInputs: null,
	connectorType: null,
	...overrides,
});

const result = { url: "x", durationSec: 0 };

describe("isStaleResult", () => {
	it("is false when no result has been produced yet", () => {
		expect(isStaleResult(snapshot(), inputs("anything"))).toBe(false);
	});

	it("is true when resultInputs is null even if a result exists", () => {
		expect(
			isStaleResult(
				snapshot({ result, resultInputs: null }),
				inputs("anything"),
			),
		).toBe(true);
	});

	it("is false when prompts and attributes match", () => {
		const i = inputs("hello", { gender: "masculine" });
		expect(
			isStaleResult(
				snapshot({ result, resultInputs: i }),
				inputs("hello", { gender: "masculine" }),
			),
		).toBe(false);
	});

	it("is true when prompt differs", () => {
		expect(
			isStaleResult(
				snapshot({ result, resultInputs: inputs("old prompt") }),
				inputs("new prompt"),
			),
		).toBe(true);
	});

	it("is true when attributes differ", () => {
		expect(
			isStaleResult(
				snapshot({
					result,
					resultInputs: inputs("hi", { gender: "masculine" }),
				}),
				inputs("hi", { gender: "feminine" }),
			),
		).toBe(true);
	});

	it("treats attribute key sets as equal regardless of insertion order", () => {
		expect(
			isStaleResult(
				snapshot({ result, resultInputs: inputs("hi", { a: "1", b: "2" }) }),
				inputs("hi", { b: "2", a: "1" }),
			),
		).toBe(false);
	});

	it("is true when current has attributes the snapshot does not", () => {
		expect(
			isStaleResult(
				snapshot({ result, resultInputs: inputs("hi", { a: "1" }) }),
				inputs("hi", { a: "1", b: "2" }),
			),
		).toBe(true);
	});
});

describe("serializeInputs", () => {
	it("produces a stable string for identical inputs", () => {
		const a = serializeInputs(inputs("hi", { gender: "masculine" }));
		const b = serializeInputs(inputs("hi", { gender: "masculine" }));
		expect(a).toBe(b);
	});

	it("produces different strings when prompts differ", () => {
		expect(serializeInputs(inputs("a"))).not.toBe(serializeInputs(inputs("b")));
	});

	it("produces different strings when attributes differ", () => {
		expect(serializeInputs(inputs("hi", { gender: "masculine" }))).not.toBe(
			serializeInputs(inputs("hi", { gender: "feminine" })),
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
			isStaleResult(snapshot({ result, resultInputs: stored }), lookedUp),
		).toBe(false);
		expect(serializeInputs(stored)).toBe(serializeInputs(lookedUp));
	});
});

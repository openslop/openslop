import { describe, expect, it } from "vitest";
import { serializeInputs, type GenerationInputs } from "../inputs";

const inputs = (
	prompt: string,
	attributes: Record<string, string> = {},
	dependencies: Record<string, string> = {},
): GenerationInputs => ({ prompt, attributes, dependencies });

describe("serializeInputs", () => {
	it("produces a stable string for identical inputs", () => {
		expect(serializeInputs(inputs("hello", { a: "1" }))).toBe(
			serializeInputs(inputs("hello", { a: "1" })),
		);
	});

	it("produces different strings when prompts differ", () => {
		expect(serializeInputs(inputs("hello"))).not.toBe(
			serializeInputs(inputs("goodbye")),
		);
	});

	it("produces different strings when attributes differ", () => {
		expect(serializeInputs(inputs("hello", { a: "1" }))).not.toBe(
			serializeInputs(inputs("hello", { a: "2" })),
		);
	});

	it("produces different strings when a dependency resolved differently", () => {
		expect(serializeInputs(inputs("hello", {}, { dep: "url-a" }))).not.toBe(
			serializeInputs(inputs("hello", {}, { dep: "url-b" })),
		);
	});

	it("is stable regardless of key insertion order", () => {
		expect(
			serializeInputs(inputs("p", { a: "1", b: "2" }, { x: "1", y: "2" })),
		).toBe(
			serializeInputs(inputs("p", { b: "2", a: "1" }, { y: "2", x: "1" })),
		);
	});
});

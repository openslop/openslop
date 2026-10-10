import { describe, expect, it } from "vitest";
import { serializeInputs } from "../inputs";
import { inputsFor } from "./_graph";

describe("serializeInputs", () => {
	it("produces a stable string for identical inputs", () => {
		expect(serializeInputs(inputsFor("hello", { a: "1" }))).toBe(
			serializeInputs(inputsFor("hello", { a: "1" })),
		);
	});

	it("produces different strings when prompts differ", () => {
		expect(serializeInputs(inputsFor("hello"))).not.toBe(
			serializeInputs(inputsFor("goodbye")),
		);
	});

	it("produces different strings when attributes differ", () => {
		expect(serializeInputs(inputsFor("hello", { a: "1" }))).not.toBe(
			serializeInputs(inputsFor("hello", { a: "2" })),
		);
	});

	it("produces different strings when a dependency resolved differently", () => {
		expect(serializeInputs(inputsFor("hello", {}, { dep: "url-a" }))).not.toBe(
			serializeInputs(inputsFor("hello", {}, { dep: "url-b" })),
		);
	});

	it("is stable regardless of key insertion order", () => {
		expect(
			serializeInputs(inputsFor("p", { a: "1", b: "2" }, { x: "1", y: "2" })),
		).toBe(
			serializeInputs(inputsFor("p", { b: "2", a: "1" }, { y: "2", x: "1" })),
		);
	});
});

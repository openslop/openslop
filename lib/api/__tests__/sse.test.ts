import { describe, expect, it } from "vitest";
import { formatSSE } from "../sse";

describe("formatSSE", () => {
	it("formats data as SSE line", () => {
		expect(formatSSE({ type: "done" })).toBe('data: {"type":"done"}\n\n');
	});

	it("formats string data", () => {
		expect(formatSSE("hello")).toBe('data: "hello"\n\n');
	});

	it("formats null", () => {
		expect(formatSSE(null)).toBe("data: null\n\n");
	});
});

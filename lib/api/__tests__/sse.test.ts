import { describe, expect, it } from "vitest";
import { formatSSE } from "../sse";

describe("formatSSE", () => {
	it("formats data as SSE line", () => {
		expect(formatSSE({ type: "done" })).toBe('data: {"type":"done"}\n\n');
	});
});

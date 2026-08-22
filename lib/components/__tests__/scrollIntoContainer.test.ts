import { describe, expect, it } from "vitest";
import { scrollTopFor } from "../scrollIntoContainer";

const extent = (top: number, height: number) => ({ top, height });

describe("scrollTopFor", () => {
	it("centers a node that sits below the container", () => {
		expect(scrollTopFor(extent(100, 500), extent(400, 100), 0, "center")).toBe(
			100,
		);
	});

	it("keeps the container's existing scroll offset in the result", () => {
		expect(
			scrollTopFor(extent(100, 500), extent(400, 100), 250, "center"),
		).toBe(350);
	});

	it("centers a node that sits above the current viewport", () => {
		expect(
			scrollTopFor(extent(100, 500), extent(-300, 100), 800, "center"),
		).toBe(200);
	});

	it("aligns the node's bottom edge with the container's for block end", () => {
		expect(scrollTopFor(extent(0, 400), extent(600, 100), 0, "end")).toBe(300);
	});

	it("never scrolls past the top of the container", () => {
		expect(scrollTopFor(extent(100, 500), extent(120, 40), 0, "center")).toBe(
			0,
		);
	});
});

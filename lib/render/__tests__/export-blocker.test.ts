import { describe, expect, it } from "vitest";
import { exportBlocker } from "../export-blocker";

const ready = { sloppyBusy: false, hasContent: true, generating: false };

describe("exportBlocker", () => {
	it("lets the video export when nothing is in the way", () => {
		expect(exportBlocker(ready)).toBeNull();
	});

	it("says Sloppy is busy before any other reason", () => {
		expect(
			exportBlocker({ sloppyBusy: true, hasContent: false, generating: true }),
		).toBe("Wait for Sloppy to finish");
	});

	it("asks for an element when there is nothing to render", () => {
		expect(exportBlocker({ ...ready, hasContent: false })).toBe(
			"Generate at least one element first",
		);
	});

	it("waits for the generation queue to finish", () => {
		expect(exportBlocker({ ...ready, generating: true })).toBe(
			"Wait for generation to finish",
		);
	});
});

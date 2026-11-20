import { describe, expect, it } from "vitest";
import {
	animateUnavailableReason,
	WAIT_FOR_ELEMENT,
	WAIT_FOR_SLOPPY,
} from "./unavailable-reasons";

describe("animateUnavailableReason", () => {
	it("explains nothing when the button is available", () => {
		expect(
			animateUnavailableReason({ sloppyBusy: false, generating: false }),
		).toBeNull();
	});

	it("waits for Sloppy before the element when both are busy", () => {
		expect(
			animateUnavailableReason({ sloppyBusy: true, generating: true }),
		).toBe(WAIT_FOR_SLOPPY);
	});

	it("waits for the element when only it is generating", () => {
		expect(
			animateUnavailableReason({ sloppyBusy: false, generating: true }),
		).toBe(WAIT_FOR_ELEMENT);
	});
});

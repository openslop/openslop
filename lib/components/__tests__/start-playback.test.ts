// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { startPlayback } from "../start-playback";

const toastError = vi.hoisted(() => vi.fn());
vi.mock("@/lib/toast-error", () => ({ toastError }));

const refusedWith = async (error: DOMException) => {
	const audio = document.createElement("audio");
	vi.spyOn(audio, "play").mockRejectedValue(error);
	startPlayback(audio);
	await Promise.resolve();
};

describe("startPlayback", () => {
	it("toasts a play the browser refuses", async () => {
		const refusal = new DOMException("Not allowed", "NotAllowedError");

		await refusedWith(refusal);

		expect(toastError).toHaveBeenCalledWith(refusal, "Could not play audio");
	});

	it("stays quiet when a pause cuts the start short", async () => {
		await refusedWith(new DOMException("Interrupted", "AbortError"));

		expect(toastError).not.toHaveBeenCalled();
	});
});

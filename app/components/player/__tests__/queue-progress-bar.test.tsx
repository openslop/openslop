import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueueProgressBar } from "../queue-progress-bar";

let counts = { active: 0, inFlight: 0, done: 0 };
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useQueueSelector: (select: (q: unknown) => unknown) =>
		select({
			getActiveCount: () => counts.active,
			getGeneratingCount: () => counts.inFlight,
			getGeneratedCount: () => counts.done,
		}),
}));

const render = (active: number, done: number, inFlight = active) => {
	counts = { active, inFlight, done };
	return renderToStaticMarkup(<QueueProgressBar />);
};

describe("QueueProgressBar", () => {
	it("is an indeterminate progressbar before anything runs", () => {
		const html = render(0, 2);
		expect(html).toContain('role="progressbar"');
		expect(html).toContain('data-state="indeterminate"');
		expect(html).not.toContain("aria-valuenow");
		expect(html).toContain("Preparing…");
	});

	it("reports the generated share while generating", () => {
		const html = render(1, 3);
		expect(html).toContain('aria-valuenow="75"');
		expect(html).toContain('aria-label="Generation progress"');
		expect(html).toContain("Generating 1 of 4 elements");
	});

	it("counts only in-flight elements in the label, not queued ones", () => {
		const html = render(3, 1, 1);
		expect(html).toContain('aria-valuenow="25"');
		expect(html).toContain("Generating 1 of 4 elements");
	});
});

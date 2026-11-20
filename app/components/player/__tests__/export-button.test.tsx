import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ExportButton } from "../export-button";

let series: unknown[] = [];
let generating = false;

vi.mock("../render-layout-context", () => ({
	useLayout: () => ({ layout: { series }, ready: false }),
}));
vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useQueueSelector: (select: (q: { isBusy: () => boolean }) => unknown) =>
		select({ isBusy: () => generating }),
}));
vi.mock("@/app/components/sloppy/sloppy-provider", () => ({
	useSloppy: () => ({ loading: false }),
}));
vi.mock("../use-export", () => ({
	useExport: () => ({
		state: { status: "idle" },
		exportVideo: vi.fn(),
		reset: vi.fn(),
		open: false,
		setOpen: vi.fn(),
	}),
}));

const render = (over: { generating?: boolean; empty?: boolean } = {}) => {
	generating = over.generating ?? false;
	series = over.empty ? [] : [{}];
	return renderToStaticMarkup(<ExportButton />);
};

describe("ExportButton", () => {
	it("is enabled while the preview is still loading its assets", () => {
		expect(render()).not.toContain(' disabled=""');
	});

	it("waits for every element to finish generating", () => {
		expect(render({ generating: true })).toContain(' disabled=""');
	});

	it("has nothing to export from an empty layout", () => {
		expect(render({ empty: true })).toContain(' disabled=""');
	});
});

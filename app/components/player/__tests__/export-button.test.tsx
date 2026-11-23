import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExportButton, exportBlocker } from "../export-button";

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
	return renderToStaticMarkup(
		<TooltipProvider>
			<ExportButton />
		</TooltipProvider>,
	);
};

describe("ExportButton", () => {
	it("is enabled while the preview is still loading its assets", () => {
		expect(render()).not.toContain('aria-disabled="true"');
	});

	it("waits for every element to finish generating", () => {
		expect(render({ generating: true })).toContain('aria-disabled="true"');
	});

	it("has nothing to export from an empty layout", () => {
		expect(render({ empty: true })).toContain('aria-disabled="true"');
	});
});

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

	it("asks for a visual or voice element when there is nothing to render", () => {
		expect(exportBlocker({ ...ready, hasContent: false })).toBe(
			"Generate at least one visual or voice element first",
		);
	});

	it("waits for the generation queue to finish", () => {
		expect(exportBlocker({ ...ready, generating: true })).toBe(
			"Wait for generation to finish",
		);
	});
});

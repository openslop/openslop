// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

let state = { ready: false, seriesLength: 0, writingScript: false };

vi.mock("../render-layout-context", () => ({
	useLayout: () => ({
		layout: { series: Array.from({ length: state.seriesLength }, () => ({})) },
		ready: state.ready,
	}),
}));
vi.mock("../../sloppy/sloppy-provider", () => ({
	useSloppy: () => ({ writingScript: state.writingScript }),
}));
vi.mock("../queue-progress-bar", () => ({
	QueueProgressBar: () => <div data-testid="loader" role="progressbar" />,
}));
vi.mock("../project-preview", () => ({
	ProjectPreview: () => <div data-testid="preview" />,
}));
vi.mock("../player-shimmer", () => ({
	PlayerShimmer: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

import { PreviewPanel } from "../preview-panel";

const render = (next: Partial<typeof state>) => {
	state = { ready: false, seriesLength: 0, writingScript: false, ...next };
	return renderToStaticMarkup(<PreviewPanel />);
};

describe("PreviewPanelBody", () => {
	it("shows the loader while the first generation is busy, before any series exist", () => {
		// ready folds in queue.isBusy(); a fresh project has an empty series.
		const html = render({ ready: false, seriesLength: 0 });
		expect(html).toContain("progressbar");
		expect(html).not.toContain("Generate elements to playback");
	});

	it("shows the empty state only when idle and there is no series", () => {
		const html = render({ ready: true, seriesLength: 0 });
		expect(html).toContain("Generate elements to playback");
		expect(html).not.toContain("progressbar");
	});

	it("shows the preview when ready with a series", () => {
		const html = render({ ready: true, seriesLength: 2 });
		expect(html).toContain("preview");
	});

	it("keeps the writing-script shim ahead of the loader", () => {
		const html = render({ writingScript: true, ready: false, seriesLength: 0 });
		expect(html).toContain("Writing script");
		expect(html).not.toContain("progressbar");
		expect(html).not.toContain("Generate elements to playback");
	});
});

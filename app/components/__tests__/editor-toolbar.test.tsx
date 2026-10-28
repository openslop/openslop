// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorToolbar } from "../editor-toolbar";

const state = vi.hoisted(() => ({
	generating: false,
	loading: false,
	writingScript: false,
	cancelAll: vi.fn(),
	stop: vi.fn(),
	run: vi.fn(),
}));

vi.mock("@/lib/generation/generation-queue-provider", () => ({
	useGenerationQueue: () => ({ cancelAll: state.cancelAll }),
	useQueueSelector: (select: (queue: { isBusy: () => boolean }) => unknown) =>
		select({ isBusy: () => state.generating }),
}));

vi.mock("@/lib/project/use-project", () => ({
	useProject: (select: (state: { title: string }) => unknown) =>
		select({ title: "Test project" }),
}));

vi.mock("../canvas/hooks/use-generate-all", () => ({
	useGenerateAll: () => ({
		empty: false,
		pending: 1,
		description: "Generate pending elements",
		run: state.run,
	}),
}));

vi.mock("../canvas/hooks/use-generate-scope", () => ({
	countPhrase: () => "Generate pending",
	NOTHING_TO_GENERATE: "Nothing to generate",
}));

vi.mock("../sloppy/sloppy-provider", () => ({
	useSloppy: () => ({
		loading: state.loading,
		writingScript: state.writingScript,
		stop: state.stop,
	}),
}));

vi.mock("../player/export-button", () => ({ ExportButton: () => null }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	state.generating = false;
	state.loading = false;
	state.writingScript = false;
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.replaceChildren();
});

function renderToolbar(
	options: {
		generating?: boolean;
		loading?: boolean;
		writingScript?: boolean;
	} = {},
) {
	state.generating = options.generating ?? false;
	state.loading = options.loading ?? false;
	state.writingScript = options.writingScript ?? false;
	act(() =>
		root.render(
			<TooltipProvider>
				<EditorToolbar
					key={`${state.generating}-${state.loading}-${state.writingScript}`}
				/>
			</TooltipProvider>,
		),
	);
}

describe("EditorToolbar cancellation", () => {
	it("stops script writing and hides the button when writing ends", () => {
		renderToolbar({ loading: true, writingScript: true });
		const button = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Cancel writing script"]',
		);
		expect(button).not.toBeNull();

		act(() => button?.click());
		expect(state.stop).toHaveBeenCalledTimes(1);
		expect(state.cancelAll).not.toHaveBeenCalled();

		renderToolbar();
		expect(
			container.querySelector('button[aria-label="Cancel writing script"]'),
		).toBeNull();
	});

	it("keeps generation cancellation available", () => {
		renderToolbar({ generating: true });
		const button = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Cancel generation"]',
		);
		expect(button).not.toBeNull();

		act(() => button?.click());
		expect(state.cancelAll).toHaveBeenCalledTimes(1);
		expect(state.stop).not.toHaveBeenCalled();
	});

	it("keeps both cancel actions independent when both are active", () => {
		renderToolbar({ generating: true, loading: true, writingScript: true });
		const cancelScript = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Cancel writing script"]',
		);
		const cancelGeneration = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Cancel generation"]',
		);
		expect(cancelScript).not.toBeNull();
		expect(cancelGeneration).not.toBeNull();

		act(() => cancelScript?.click());
		act(() => cancelGeneration?.click());
		expect(state.stop).toHaveBeenCalledTimes(1);
		expect(state.cancelAll).toHaveBeenCalledTimes(1);
	});

	it("shows no cancel action when neither operation is active", () => {
		renderToolbar();
		expect(container.querySelector('button[aria-label^="Cancel "]')).toBeNull();
	});
});

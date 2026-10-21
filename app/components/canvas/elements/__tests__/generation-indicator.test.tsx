// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationIndicator } from "../generation-indicator";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const render = (node: React.ReactNode) =>
	renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);

describe("GenerationIndicator", () => {
	it("is a named status marker, not a disabled button", () => {
		const html = render(
			<GenerationIndicator status="generating" startedAt={null} />,
		);
		expect(html).toContain('role="status"');
		expect(html).toContain('aria-label="Generating 0s"');
		expect(html).not.toContain("<button");
		expect(html).not.toContain("disabled");
	});

	it("pairs the media scrim with the on-media foreground", () => {
		const html = render(
			<GenerationIndicator status="queued" startedAt={null} size="sm" />,
		);
		expect(html).toContain("bg-on-media/55");
		expect(html).toContain("text-on-media-foreground");
		expect(html).not.toContain("text-foreground");
	});
});

describe("GenerationIndicator clock", () => {
	const container = document.body.appendChild(document.createElement("div"));
	let root: Root;

	beforeEach(() => {
		vi.useFakeTimers();
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		vi.useRealTimers();
	});

	const label = () =>
		container.querySelector('[role="status"]')?.getAttribute("aria-label");

	it("counts whole seconds from when the job started, on its own", async () => {
		vi.setSystemTime(10_000);
		await act(async () =>
			root.render(
				<TooltipProvider>
					<GenerationIndicator status="generating" startedAt={7_000} />
				</TooltipProvider>,
			),
		);
		expect(label()).toBe("Generating 3s");

		await act(() => vi.advanceTimersByTimeAsync(1_000));
		expect(label()).toBe("Generating 4s");
	});
});

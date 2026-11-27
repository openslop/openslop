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

	it.each([
		["queued", "Queued…"],
		["generating", "Generating 0s"],
	] as const)(
		"shows the %s label beside the icon on wide screens, hidden from screen readers",
		(status, label) => {
			const html = render(
				<GenerationIndicator status={status} startedAt={null} />,
			);
			const shown = html.match(
				/<span aria-hidden="true" class="([^"]*)">([^<]*)<\/span>/,
			);
			expect(shown?.[2]).toBe(label);
			expect(shown?.[1]).toContain("shimmer");
			expect(shown?.[1]).toMatch(/(^| )hidden( |$)/);
			expect(shown?.[1]).toContain("md:inline");
			expect(html).toContain(`aria-label="${label}"`);
		},
	);

	it("names what a queued element waits on, keeping the short label on screen", () => {
		const reason = "Waiting for Red's image";
		const html = render(
			<GenerationIndicator
				status="queued"
				startedAt={null}
				queuedReason={reason}
			/>,
		);
		expect(html).toContain(`aria-label="${reason.replace("'", "&#x27;")}"`);
		expect(html).toMatch(/<span aria-hidden="true" class="[^"]*">Queued…</);
	});

	it("keeps the small indicator to its icon", () => {
		const html = render(
			<GenerationIndicator status="generating" startedAt={null} size="sm" />,
		);
		const shown = html.match(/<span aria-hidden="true" class="([^"]*)">/);
		expect(shown?.[1]).toMatch(/(^| )hidden( |$)/);
		expect(shown?.[1]).not.toContain("md:inline");
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
	const shown = () =>
		container.querySelector('[role="status"] [aria-hidden="true"].shimmer')
			?.textContent;

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
		expect(shown()).toBe("Generating 3s");

		await act(() => vi.advanceTimersByTimeAsync(1_000));
		expect(label()).toBe("Generating 4s");
		expect(shown()).toBe("Generating 4s");
	});
});

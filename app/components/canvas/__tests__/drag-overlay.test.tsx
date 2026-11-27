// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createNameRef } from "@/lib/canvas/name-refs";
import type { ContentElement } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { DragOverlayPreview } from "../dnd/drag-overlay";
import { ViewModeProvider } from "../view-mode-context";
import { mountOnCanvas, noHistory } from "./_mount";

vi.mock("../elements/element-container", () => ({
	ElementContainer: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

const image = (...cast: string[]): ContentElement => ({
	id: "i",
	type: "image",
	children: [
		{ id: "i-t", text: "" },
		...cast.flatMap((name) => [
			createNameRef(name),
			{ id: `${name}-t`, text: "" },
		]),
	],
});

let canvas: ReturnType<typeof mountOnCanvas>;

afterEach(() => canvas.unmount());

const drag = (block: ContentElement) => {
	canvas = mountOnCanvas([asset("asset_avatar", { name: "Mia" })]);
	return canvas.render(
		<GenerationQueueProvider initialState={{}} storage={noHistory}>
			<TooltipProvider>
				<ViewModeProvider>
					<DragOverlayPreview block={block} />
				</ViewModeProvider>
			</TooltipProvider>
		</GenerationQueueProvider>,
	);
};

describe("DragOverlayPreview", () => {
	it("previews an element whose prompt names its cast", async () => {
		await drag(image("Mia"));

		expect(document.body.textContent).toContain("Mia");
	});

	it("resolves the cast against the canvas, not the dragged node alone", async () => {
		await drag(image("Mia", "Kai"));

		expect(document.body.textContent).not.toContain("Unknown asset: Mia");
		expect(document.body.textContent).toContain("Unknown asset: Kai");
	});

	it("draws the gutter's own insert and drag buttons", async () => {
		await drag(image());

		for (const label of ["Insert item", "Drag to reorder"]) {
			expect(document.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
		}
	});
});

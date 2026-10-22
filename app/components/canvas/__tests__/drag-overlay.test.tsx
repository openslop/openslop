// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createCharacterRef } from "@/lib/canvas/character-refs";
import type { ContentElement } from "@/lib/canvas/types";
import { asset } from "@/lib/canvas/__tests__/_assets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import type { ElementVersionStorage } from "@/lib/generation/history";
import { DragOverlayPreview } from "../dnd/drag-overlay";
import { ViewModeProvider } from "../view-mode-context";
import { mountOnCanvas } from "./_mount";

vi.mock("../elements/element-container", () => ({
	ElementContainer: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const image = (...cast: string[]): ContentElement => ({
	id: "i",
	type: "image",
	children: [
		{ id: "i-t", type: "image", text: "" },
		...cast.flatMap((name) => [
			createCharacterRef(name),
			{ id: `${name}-t`, type: "image" as const, text: "" },
		]),
	],
});

const untouched = () =>
	Promise.reject(new Error("a drag preview reads no history"));
const noHistory: ElementVersionStorage = { read: untouched, write: untouched };

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

		expect(document.body.textContent).not.toContain("Unknown character: Mia");
		expect(document.body.textContent).toContain("Unknown character: Kai");
	});
});

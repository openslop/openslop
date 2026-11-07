// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { User } from "@/components/ui/icon";
import { TooltipProvider } from "@/components/ui/tooltip";
import { click, mountOnCanvas } from "../../__tests__/_mount";
import { AssetTile } from "../asset-tile";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const AVATAR = "https://cdn.example/mia.png";
const VIEW = 'button[aria-label="View Mia larger"]';

const onEdit = vi.fn();
let canvas: ReturnType<typeof mountOnCanvas>;

function renderTile(previewUrl?: string) {
	canvas.render(
		<TooltipProvider>
			<AssetTile
				name="Mia"
				previewUrl={previewUrl}
				Icon={User}
				onEdit={onEdit}
			/>
		</TooltipProvider>,
	);
}

const viewer = () => document.body.querySelector('[role="dialog"]');

beforeEach(() => {
	canvas = mountOnCanvas();
});

afterEach(() => canvas.unmount());

describe("AssetTile", () => {
	it("opens the full-size picture without editing the asset", async () => {
		renderTile(AVATAR);
		await click(VIEW);

		expect(onEdit).not.toHaveBeenCalled();
		expect(viewer()?.querySelector("img")?.getAttribute("src")).toBe(AVATAR);
		expect(viewer()?.textContent).toContain("Mia");
	});

	it("closes on Escape and hands focus back to the tile", async () => {
		renderTile(AVATAR);
		await click(VIEW);
		await act(async () => {
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await act(() => new Promise((resolve) => setTimeout(resolve)));

		expect(viewer()).toBeNull();
		expect(document.activeElement).toBe(document.body.querySelector(VIEW));
	});

	it("leads the caption with the asset's icon", () => {
		renderTile();
		expect(
			document.body.querySelector('[data-slot="thumbnail-caption"] .icon'),
		).not.toBeNull();
	});

	it("offers no viewer until there is a picture", () => {
		renderTile();
		expect(document.body.querySelector(VIEW)).toBeNull();
	});
});

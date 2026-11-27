// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { createEditor, type Descendant } from "slate";
import { Slate, withReact } from "slate-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { asset, element } from "@/lib/canvas/__tests__/_assets";

vi.mock("@/app/components/canvas/hooks/use-image-asset", () => ({
	useImageAsset: () => ({ url: "" }),
}));

vi.mock("../asset-edit-context", () => ({
	useAssetEditors: () => ({ openCreateNamedAsset: () => {} }),
}));

import { CharacterSwitcher } from "../character-switcher";

const LABEL = "Select which character speaks";
const label = (html: string) => /aria-label="([^"]*)"/.exec(html)?.[1];

function render(name: string | undefined, characters: string[]) {
	const line = element("el", "speech", "", name ? { name } : {});
	const nodes = [
		...characters.map((character) => asset("asset_voice", { name: character })),
		line,
	] as Descendant[];
	return renderToStaticMarkup(
		<TooltipProvider>
			<Slate editor={withReact(createEditor())} initialValue={nodes}>
				<CharacterSwitcher element={line} />
			</Slate>
		</TooltipProvider>,
	);
}

describe("CharacterSwitcher", () => {
	it("says a line has no character picked", () => {
		expect(label(render(undefined, ["Hero"]))).toBe(
			`No character picked for this line. ${LABEL}`,
		);
	});

	it("says a line's character doesn't exist", () => {
		expect(label(render("Ghost", ["Hero"]))).toBe(
			`No character named Ghost. ${LABEL}`,
		);
	});

	it("opens the picker even before the project has characters", () => {
		expect(label(render(undefined, []))).toBe(
			`No character picked for this line. ${LABEL}`,
		);
	});

	it("shows no problem for a known character", () => {
		expect(label(render("Hero", ["Hero"]))).toBe(LABEL);
	});

	it("lists the characters in the menu's own text color, not greyed out", () => {
		const line = element("el", "speech", "", { name: "Hero" });
		const nodes = [
			asset("asset_voice", { name: "Hero" }),
			asset("asset_voice", { name: "Mia" }),
			line,
		] as Descendant[];
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		act(() =>
			root.render(
				<TooltipProvider>
					<Slate editor={withReact(createEditor())} initialValue={nodes}>
						<CharacterSwitcher element={line} />
					</Slate>
				</TooltipProvider>,
			),
		);
		const trigger = container.querySelector("button");
		act(() => {
			trigger?.dispatchEvent(
				new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
			);
			trigger?.click();
		});

		const rows = Array.from(
			document.body.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
		);
		const named = (text: string) =>
			rows.find((row) => row.textContent?.includes(text));
		expect(named("Hero")).toBeDefined();
		expect(named("Mia")).toBeDefined();
		// The row's own color: the shared [&_svg]:text-muted-foreground only greys icons.
		for (const row of rows)
			expect(row.className.split(/\s+/)).not.toContain("text-muted-foreground");

		act(() => root.unmount());
		container.remove();
	});
});

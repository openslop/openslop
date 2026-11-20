import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Descendant } from "slate";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { asset, element } from "@/lib/canvas/__tests__/_assets";

vi.mock("@/app/components/canvas/hooks/use-character-avatar", () => ({
	useCharacterAvatar: () => ({ url: "" }),
}));

vi.mock("../asset-edit-context", () => ({
	useAssetEditors: () => ({ openCreateCharacter: () => {} }),
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
});

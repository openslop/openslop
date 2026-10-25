import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Descendant } from "slate";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { asset, element } from "@/lib/canvas/__tests__/_assets";

vi.mock("../../hooks/use-character-avatar", () => ({
	useCharacterAvatar: () => ({ url: "" }),
}));

import { CharacterSwitcher } from "../character-switcher";

const MISSING = 'aria-label="Character missing"';

function render(name: string | undefined, characters: string[]) {
	const line = element("el", "character", "", name ? { name } : {});
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
	it("flags a line with no character picked", () => {
		const html = render(undefined, ["Hero"]);
		expect(html).toContain(MISSING);
		expect(html).toContain(
			'aria-label="Character missing. Select which character speaks"',
		);
	});

	it("flags a line whose character is gone", () => {
		expect(render("Ghost", ["Hero"])).toContain(MISSING);
	});

	it("flags an unset line even before the project has characters", () => {
		expect(render(undefined, [])).toContain(MISSING);
	});

	it("shows no alert for a known character", () => {
		const html = render("Hero", ["Hero"]);
		expect(html).not.toContain(MISSING);
		expect(html).toContain('aria-label="Select which character speaks"');
	});
});

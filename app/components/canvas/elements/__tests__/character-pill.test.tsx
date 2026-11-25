// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

const avatar = vi.hoisted(() => ({ url: "" }));
vi.mock("@/app/components/canvas/hooks/use-picture", () => ({
	usePicture: () => avatar,
}));

import { AssetAvatar } from "../asset-avatar";
import { CharacterPill } from "../character-pill";

describe("AssetAvatar placeholder", () => {
	it("shows the character icon, not a letter, when a picked character has no avatar", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<AssetAvatar name="Narrator" />);
		expect(html).toContain('data-slot="avatar-fallback"');
		expect(html).toContain("--user-icon");
		expect(html).not.toContain(">N<");
	});

	it("shows the same placeholder when no character is picked", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<AssetAvatar />);
		expect(html).toContain("--user-icon");
	});

	it("the placeholder is also the pre-load state while an avatar is set", () => {
		// Radix mounts the img only once the browser has loaded it
		avatar.url = "https://example.com/a.png";
		const html = renderToStaticMarkup(<AssetAvatar name="Hero" />);
		expect(html).toContain("--user-icon");
	});

	it("the pill without a name is the placeholder plus what it's handed", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(
			<CharacterPill>
				<i>flag</i>
			</CharacterPill>,
		);
		expect(html).toContain("--user-icon");
		expect(html).toContain("<i>flag</i>");
		expect(html).not.toMatch(/>[A-Z]</);
	});
});

class LoadedImage {
	src = "";
	complete = true;
	naturalWidth = 1;
	addEventListener() {}
	removeEventListener() {}
}

describe("AssetAvatar after its avatar goes away", () => {
	it("brings the placeholder back, as when undo unpicks a character", () => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
		vi.stubGlobal("Image", LoadedImage);
		const container = document.createElement("div");
		const root = createRoot(container);

		avatar.url = "https://example.com/a.png";
		act(() => root.render(<AssetAvatar name="Hero" />));
		expect(container.querySelector("img")).not.toBeNull();

		avatar.url = "";
		act(() => root.render(<AssetAvatar />));
		expect(container.innerHTML).toContain("--user-icon");

		act(() => root.unmount());
	});
});

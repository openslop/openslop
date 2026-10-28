// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

const avatar = vi.hoisted(() => ({ url: "" }));
vi.mock("../../hooks/use-character-avatar", () => ({
	useCharacterAvatar: () => avatar,
}));

import { CharacterAvatar, CharacterPill } from "../character-pill";

describe("CharacterAvatar placeholder", () => {
	it("shows the character icon, not a letter, when a picked character has no avatar", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<CharacterAvatar name="Narrator" />);
		expect(html).toContain('data-slot="avatar-fallback"');
		expect(html).toContain("--user-icon");
		expect(html).not.toContain(">N<");
	});

	it("shows the same placeholder when no character is picked", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<CharacterAvatar />);
		expect(html).toContain("--user-icon");
	});

	it("the placeholder is also the pre-load state while an avatar is set", () => {
		// Radix mounts the img only once the browser has loaded it
		avatar.url = "https://example.com/a.png";
		const html = renderToStaticMarkup(<CharacterAvatar name="Hero" />);
		expect(html).toContain("--user-icon");
	});

	it("the pill without a name is the placeholder plus what it's handed, styled like a header button", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(
			<CharacterPill>
				<i>flag</i>
			</CharacterPill>,
		);
		expect(html).toContain("text-muted-foreground");
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

describe("CharacterAvatar after its avatar goes away", () => {
	it("brings the placeholder back, as when undo unpicks a character", () => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
		vi.stubGlobal("Image", LoadedImage);
		const container = document.createElement("div");
		const root = createRoot(container);

		avatar.url = "https://example.com/a.png";
		act(() => root.render(<CharacterAvatar name="Hero" />));
		expect(container.querySelector("img")).not.toBeNull();

		avatar.url = "";
		act(() => root.render(<CharacterAvatar />));
		expect(container.innerHTML).toContain("--user-icon");

		act(() => root.unmount());
	});
});

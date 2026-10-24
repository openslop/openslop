import { describe, expect, it, vi } from "vitest";
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
		expect(html).toContain("text-media-character");
		expect(html).toContain("bg-media-character/15");
		expect(html).not.toContain(">N<");
	});

	it("shows the same placeholder when no character is picked", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<CharacterAvatar />);
		expect(html).toContain("text-media-character");
	});

	it("the placeholder is also the pre-load state while an avatar is set", () => {
		// the img itself only mounts after the browser loads it, so a static
		// render shows the fallback; the AvatarImage path is untouched by this change
		avatar.url = "https://example.com/a.png";
		const html = renderToStaticMarkup(<CharacterAvatar name="Hero" />);
		expect(html).toContain("text-media-character");
	});

	it("the pill without a name is just the placeholder", () => {
		avatar.url = "";
		const html = renderToStaticMarkup(<CharacterPill />);
		expect(html).toContain("text-media-character");
		expect(html).not.toMatch(/>[A-Z]</);
	});
});

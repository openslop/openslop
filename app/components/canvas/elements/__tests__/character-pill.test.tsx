// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CharacterAvatar, CharacterPill } from "../character-pill";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("../../hooks/use-character-avatar", () => ({
	useCharacterAvatar: () => ({ url: undefined }),
}));

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(() => {
	root = createRoot(container);
});

afterEach(() => act(() => root.unmount()));

const render = (ui: React.ReactNode) => act(() => root.render(ui));

function fallback() {
	const found = container.querySelector<HTMLElement>(
		'[data-slot="avatar-fallback"]',
	);
	if (!found) throw new Error("no avatar fallback rendered");
	return found;
}

describe("CharacterAvatar placeholder", () => {
	it("shows the character element's icon in its media tint when no character is picked", () => {
		render(<CharacterPill />);

		const placeholder = fallback();
		expect(placeholder.querySelector(".icon")).not.toBeNull();
		expect(placeholder.className).toContain("text-media-character");
		expect(placeholder.className).toContain("bg-media-character/15");
	});

	it("shows the same icon, not an initial, for a character with no avatar image", () => {
		render(<CharacterPill name="Narrator" />);

		const placeholder = fallback();
		expect(placeholder.textContent).toBe("");
		expect(placeholder.querySelector(".icon")).not.toBeNull();
		expect(placeholder.className).toContain("text-media-character");
		expect(container.textContent).toBe("Narrator");
	});

	it("sizes the icon to the avatar", () => {
		render(<CharacterAvatar name="Narrator" />);
		const sm = fallback().querySelector<HTMLElement>(".icon")?.style.fontSize;

		render(<CharacterAvatar name="Narrator" size="xs" />);
		const xs = fallback().querySelector<HTMLElement>(".icon")?.style.fontSize;

		expect(sm).toBe("16px");
		expect(xs).toBe("12px");
	});
});

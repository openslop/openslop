// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";

const image = vi.hoisted(() => ({ url: "" }));
vi.mock("@/app/components/canvas/hooks/use-image-asset", () => ({
	useImageAsset: () => image,
}));

import { NamedAssetImage } from "../named-asset-image";
import { CharacterPill } from "../character-pill";

describe("NamedAssetImage placeholder", () => {
	it("shows the character icon, not a letter, when a picked character has no avatar", () => {
		image.url = "";
		const html = renderToStaticMarkup(<NamedAssetImage name="Narrator" />);
		expect(html).toContain('data-slot="avatar-fallback"');
		expect(html).toContain("--user-icon");
		expect(html).not.toContain(">N<");
	});

	it("shows the same placeholder when no character is picked", () => {
		image.url = "";
		const html = renderToStaticMarkup(<NamedAssetImage />);
		expect(html).toContain("--user-icon");
	});

	it("the placeholder is also the pre-load state while an avatar is set", () => {
		// Radix mounts the img only once the browser has loaded it
		image.url = "https://example.com/a.png";
		const html = renderToStaticMarkup(<NamedAssetImage name="Hero" />);
		expect(html).toContain("--user-icon");
	});

	it("the pill without a name is the placeholder plus what it's handed", () => {
		image.url = "";
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

describe("NamedAssetImage after its image goes away", () => {
	it("brings the placeholder back, as when undo unpicks a character", () => {
		Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
		vi.stubGlobal("Image", LoadedImage);
		const container = document.createElement("div");
		const root = createRoot(container);

		image.url = "https://example.com/a.png";
		act(() => root.render(<NamedAssetImage name="Hero" />));
		expect(container.querySelector("img")).not.toBeNull();

		image.url = "";
		act(() => root.render(<NamedAssetImage />));
		expect(container.innerHTML).toContain("--user-icon");

		act(() => root.unmount());
	});
});

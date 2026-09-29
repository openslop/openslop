import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlayPauseFlash } from "../PlayPauseFlash";

describe("PlayPauseFlash", () => {
	it("pairs the media scrim with the on-media foreground", () => {
		const html = renderToStaticMarkup(
			<PlayPauseFlash flash={{ key: 1, playing: true }} />,
		);
		expect(html).toContain("bg-on-media/55");
		expect(html).toContain("text-on-media-foreground");
		expect(html).not.toContain("text-foreground");
	});

	it("renders nothing without a flash", () => {
		expect(renderToStaticMarkup(<PlayPauseFlash flash={null} />)).toBe("");
	});
});

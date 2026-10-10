import { describe, expect, it, vi } from "vitest";
import type { PlayerRef } from "@remotion/player";
import { renderToStaticMarkup } from "react-dom/server";
import { FullscreenButton, VolumeControl } from "../player-controls";

let player: PlayerRef | null = null;

vi.mock("../player-control-context", () => ({
	usePlayerControl: () => ({ player }),
}));

const render = (mounted: boolean) => {
	player = mounted ? ({} as PlayerRef) : null;
	return renderToStaticMarkup(
		<>
			<VolumeControl />
			<FullscreenButton />
		</>,
	);
};

const count = (html: string, attribute: string) =>
	html.split(attribute).length - 1;

describe("player controls without a mounted player", () => {
	it("disables mute, volume and fullscreen", () => {
		const html = render(false);

		expect(count(html, ' disabled=""')).toBe(2);
		expect(html).toContain('aria-disabled="true"');
	});

	it("enables all three once a player mounts", () => {
		const html = render(true);

		expect(html).not.toContain(' disabled=""');
		expect(html).not.toContain("aria-disabled");
	});
});

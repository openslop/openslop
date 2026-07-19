import { describe, expect, it, vi } from "vitest";
import { startPlaybackAt, type PlaybackTarget } from "../startPlaybackAt";

function makePlayer(containerNode: HTMLElement | null = null) {
	const calls: string[] = [];
	const player: PlaybackTarget = {
		pause: vi.fn(() => {
			calls.push("pause");
		}),
		seekTo: vi.fn((frame: number) => {
			calls.push(`seekTo:${frame}`);
		}),
		play: vi.fn(() => {
			calls.push("play");
		}),
		getContainerNode: vi.fn(() => {
			calls.push("getContainerNode");
			return containerNode;
		}),
	} as unknown as PlaybackTarget;
	return { player, calls };
}

describe("startPlaybackAt", () => {
	// Regression for #425: firing seekTo + play in one tick without pausing let
	// the shared audio tags run while the frame driver stayed frozen.
	it("pauses and seeks before playing", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 120);

		expect(calls).toEqual(["pause", "seekTo:120", "getContainerNode", "play"]);
	});

	it("seeks to the requested frame", () => {
		const { player } = makePlayer();

		startPlaybackAt(player, 42);

		expect(player.seekTo).toHaveBeenCalledWith(42);
	});

	it("never plays before seeking", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 7);

		expect(calls.indexOf("play")).toBeGreaterThan(calls.indexOf("seekTo:7"));
	});

	it("silences stray media between the seek and the play", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 3);

		const silenced = calls.indexOf("getContainerNode");
		expect(silenced).toBeGreaterThan(calls.indexOf("seekTo:3"));
		expect(silenced).toBeLessThan(calls.indexOf("play"));
	});

	it("tolerates a player with no container node yet", () => {
		const { player } = makePlayer(null);

		expect(() => startPlaybackAt(player, 0)).not.toThrow();
		expect(player.play).toHaveBeenCalledOnce();
	});

	it("no-ops when the player has not mounted", () => {
		expect(() => startPlaybackAt(null, 120)).not.toThrow();
	});
});

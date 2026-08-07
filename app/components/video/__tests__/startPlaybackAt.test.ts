import type { SyntheticEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { startPlaybackAt, type PlaybackTarget } from "../startPlaybackAt";

function makePlayer(containerNode: HTMLDivElement | null = null) {
	const calls: string[] = [];
	const player: PlaybackTarget = {
		play: vi.fn(() => {
			calls.push("play");
		}),
		seekTo: vi.fn((frame: number) => {
			calls.push(`seekTo:${frame}`);
		}),
		getContainerNode: vi.fn(() => {
			calls.push("getContainerNode");
			return containerNode;
		}),
	};
	return { player, calls };
}

describe("startPlaybackAt", () => {
	// Regression for #425: playing after the seek leaves the shared audio tags
	// running against a parked frame driver.
	it("plays before seeking, so the seek resumes rather than starts playback", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 120);

		expect(calls).toEqual(["play", "seekTo:120", "getContainerNode"]);
	});

	it("forwards the originating event to play", () => {
		const { player } = makePlayer();
		const event = {} as SyntheticEvent;

		startPlaybackAt(player, 7, event);

		expect(player.play).toHaveBeenCalledWith(event);
	});

	it("tolerates a player with no container node yet", () => {
		const { player } = makePlayer(null);

		expect(() => startPlaybackAt(player, 0)).not.toThrow();
		expect(player.play).toHaveBeenCalledOnce();
	});
});

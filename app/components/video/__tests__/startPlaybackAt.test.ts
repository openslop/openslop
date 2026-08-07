import type { SyntheticEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { startPlaybackAt, type PlaybackTarget } from "../startPlaybackAt";

function makePlayer(containerNode: HTMLElement | null = null) {
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
	} as unknown as PlaybackTarget;
	return { player, calls };
}

describe("startPlaybackAt", () => {
	// Regression for #425. The player has to be playing when the seek lands, so
	// that Remotion owns the pause/seek/replay and defers the replay past the
	// buffering its own seek triggers. Playing after the seek instead leaves the
	// shared audio tags running against a parked frame driver.
	it("plays before seeking, so the seek resumes rather than starts playback", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 120);

		expect(calls).toEqual(["play", "seekTo:120", "getContainerNode"]);
	});

	it("seeks to the requested frame", () => {
		const { player } = makePlayer();

		startPlaybackAt(player, 42);

		expect(player.seekTo).toHaveBeenCalledWith(42);
	});

	// Remotion only warms the shared audio tag pool for autoplay when play() is
	// given the event, so the originating click has to reach it.
	it("forwards the originating event to play", () => {
		const { player } = makePlayer();
		const event = {} as SyntheticEvent;

		startPlaybackAt(player, 7, event);

		expect(player.play).toHaveBeenCalledWith(event);
	});

	it("silences stray media only once the seek has landed", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 3);

		expect(calls.indexOf("getContainerNode")).toBeGreaterThan(
			calls.indexOf("seekTo:3"),
		);
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

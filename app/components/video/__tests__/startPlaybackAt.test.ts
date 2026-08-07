import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startPlaybackAt, type PlaybackTarget } from "../startPlaybackAt";

let frameCallbacks: FrameRequestCallback[] = [];

beforeEach(() => {
	frameCallbacks = [];
	vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
		frameCallbacks.push(cb),
	);
});

afterEach(() => vi.unstubAllGlobals());

function nextFrame() {
	const due = frameCallbacks;
	frameCallbacks = [];
	for (const cb of due) cb(0);
}

function makePlayer(containerNode: HTMLDivElement | null = null) {
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
	};
	return { player, calls };
}

describe("startPlaybackAt", () => {
	// Regression for #425: playing in the same tick as the seek runs the shared
	// audio tags against a frame driver parked on the seek's buffering block.
	it("holds the play back until the frame after the seek", () => {
		const { player, calls } = makePlayer();

		startPlaybackAt(player, 120);

		expect(calls).toEqual(["pause", "seekTo:120", "getContainerNode"]);

		nextFrame();

		expect(calls).toEqual(["pause", "seekTo:120", "getContainerNode", "play"]);
	});

	it("tolerates a player with no container node yet", () => {
		const { player } = makePlayer(null);

		expect(() => startPlaybackAt(player, 0)).not.toThrow();
		nextFrame();
		expect(player.play).toHaveBeenCalledOnce();
	});
});

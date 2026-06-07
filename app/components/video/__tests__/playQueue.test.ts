import type { PlayerRef } from "@remotion/player";
import { describe, expect, it, vi } from "vitest";
import { createPlayQueue } from "../playQueue";

const makePlayer = () =>
	({
		seekTo: vi.fn(),
		play: vi.fn(),
	}) as unknown as PlayerRef & {
		seekTo: ReturnType<typeof vi.fn>;
		play: ReturnType<typeof vi.fn>;
	};

describe("createPlayQueue", () => {
	it("plays immediately when a player is already registered", () => {
		const showPlayer = vi.fn();
		const queue = createPlayQueue(showPlayer);
		const player = makePlayer();
		queue.registerPlayer(player);

		queue.playFromFrame(42);

		expect(showPlayer).toHaveBeenCalledOnce();
		expect(player.seekTo).toHaveBeenCalledWith(42);
		expect(player.play).toHaveBeenCalledOnce();
	});

	it("defers play until the player registers", () => {
		const showPlayer = vi.fn();
		const queue = createPlayQueue(showPlayer);

		queue.playFromFrame(120);
		expect(showPlayer).toHaveBeenCalledOnce();

		const player = makePlayer();
		queue.registerPlayer(player);

		expect(player.seekTo).toHaveBeenCalledWith(120);
		expect(player.play).toHaveBeenCalledOnce();
	});

	it("does not replay the pending frame on subsequent re-registers", () => {
		const queue = createPlayQueue(vi.fn());
		queue.playFromFrame(7);

		const player = makePlayer();
		queue.registerPlayer(player);
		expect(player.play).toHaveBeenCalledOnce();

		queue.registerPlayer(null);
		const next = makePlayer();
		queue.registerPlayer(next);

		expect(next.seekTo).not.toHaveBeenCalled();
		expect(next.play).not.toHaveBeenCalled();
	});

	it("uses the latest pending frame when playFromFrame is called multiple times before mount", () => {
		const queue = createPlayQueue(vi.fn());
		queue.playFromFrame(10);
		queue.playFromFrame(99);

		const player = makePlayer();
		queue.registerPlayer(player);

		expect(player.seekTo).toHaveBeenCalledExactlyOnceWith(99);
		expect(player.play).toHaveBeenCalledOnce();
	});
});

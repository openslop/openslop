// @vitest-environment happy-dom

import type { PlayerRef } from "@remotion/player";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	PlayerControlProvider,
	usePlayerControl,
} from "../player-control-context";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const spies = vi.hoisted(() => ({
	showPlayer: vi.fn(),
	startPlaybackAt: vi.fn(),
}));
vi.mock("../player-placement-context", () => ({
	usePlayerPlacement: () => ({ showPlayer: spies.showPlayer }),
}));
vi.mock("../start-playback-at", () => ({
	startPlaybackAt: spies.startPlaybackAt,
}));

const fakePlayer = (frame: number) =>
	({ getCurrentFrame: () => frame, seekTo: vi.fn() }) as unknown as PlayerRef;

let control: ReturnType<typeof usePlayerControl>;
function Reader({ onRead }: { onRead: (value: typeof control) => void }) {
	onRead(usePlayerControl());
	return null;
}

const container = document.body.appendChild(document.createElement("div"));
let root: Root;

beforeEach(async () => {
	root = createRoot(container);
	await act(async () =>
		root.render(
			<PlayerControlProvider>
				<Reader onRead={(value) => (control = value)} />
			</PlayerControlProvider>,
		),
	);
});

afterEach(() => act(() => root.unmount()));

const register = (player: PlayerRef | null) =>
	act(() => control.registerPlayer(player));

it("starts the first player where it is", async () => {
	const first = fakePlayer(0);
	await register(first);
	expect(first.seekTo).not.toHaveBeenCalled();
});

it("play from here with no player mounted shows the panel at that frame", async () => {
	await act(() => control.playFromFrame(7));
	expect(spies.showPlayer).toHaveBeenCalled();
	expect(spies.startPlaybackAt).not.toHaveBeenCalled();

	const next = fakePlayer(0);
	await register(next);
	expect(next.seekTo).toHaveBeenCalledWith(7);
});

it("a player that mounts again picks up the frame the last one left", async () => {
	await register(fakePlayer(42));
	await register(null);

	const next = fakePlayer(0);
	await register(next);
	expect(next.seekTo).toHaveBeenCalledWith(42);
});

it("play from here with a mounted player plays at once", async () => {
	const player = fakePlayer(0);
	await register(player);
	await act(() => control.playFromFrame(7));
	expect(spies.startPlaybackAt).toHaveBeenCalledWith(player, 7);
});

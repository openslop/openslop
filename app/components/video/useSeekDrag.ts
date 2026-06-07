"use client";

import type { PlayerRef } from "@remotion/player";
import { type PointerEvent, useRef } from "react";

type Seek = (e: PointerEvent<HTMLDivElement>) => void;

function silenceMediaIn(node: HTMLElement | null) {
	if (!node) return;
	const tags = node.querySelectorAll("audio, video");
	for (const el of tags) {
		if (el instanceof HTMLMediaElement && !el.paused) el.pause();
	}
}

export function useSeekDrag(player: PlayerRef | null, seek: Seek) {
	const dragRef = useRef<{ wasPlaying: boolean } | null>(null);

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		if (!player) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		const wasPlaying = player.isPlaying();
		dragRef.current = { wasPlaying };
		if (wasPlaying) {
			player.pause();
			silenceMediaIn(player.getContainerNode());
		}
		seek(e);
	};

	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
		seek(e);
		if (dragRef.current?.wasPlaying)
			silenceMediaIn(player?.getContainerNode() ?? null);
	};

	const finishDrag = (e: PointerEvent<HTMLDivElement>) => {
		if (e.currentTarget.hasPointerCapture(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
		const state = dragRef.current;
		dragRef.current = null;
		if (state?.wasPlaying) {
			player?.play();
		}
	};

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: finishDrag,
		onPointerCancel: finishDrag,
	};
}

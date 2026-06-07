"use client";

import type { PlayerRef } from "@remotion/player";
import dynamic from "next/dynamic";
import { useEffect, useState, type PointerEvent, type Ref } from "react";
import type { VideoLayout } from "@/lib/video/types";
import { ToastErrorBoundary } from "../ToastErrorBoundary";
import { ActiveSceneSync } from "./ActiveSceneSync";
import { usePlayerControl } from "./PlayerControlContext";
import { PlayerControls } from "./PlayerControls";
import { PlayPauseFlash } from "./PlayPauseFlash";
import { useControlsVisibility } from "./useControlsVisibility";
import { useSceneSegments } from "./useSceneSegments";
import styles from "./VideoPlayer.module.css";

const fullWidthStyle = { width: "100%" };

const RemotionPlayer = dynamic(
	async () => {
		const [{ Player }, { VideoComposition }] = await Promise.all([
			import("@remotion/player"),
			import("@/remotion/compositions/VideoComposition"),
		]);

		function RemotionPlayerInner({
			layout,
			playerRef,
		}: {
			layout: VideoLayout;
			playerRef: Ref<PlayerRef>;
		}) {
			return (
				<Player
					ref={playerRef}
					component={VideoComposition}
					inputProps={layout}
					durationInFrames={layout.totalFrames}
					fps={layout.fps}
					compositionWidth={layout.width}
					compositionHeight={layout.height}
					style={fullWidthStyle}
					clickToPlay={false}
					acknowledgeRemotionLicense
					numberOfSharedAudioTags={10}
				/>
			);
		}

		return { default: RemotionPlayerInner };
	},
	{ ssr: false },
);

export function VideoPreview({ layout }: { layout: VideoLayout }) {
	const [player, setPlayer] = useState<PlayerRef | null>(null);
	const { visible, ping, leave } = useControlsVisibility();
	const segments = useSceneSegments();
	const { registerPlayer } = usePlayerControl();
	const [flash, setFlash] = useState<{ key: number; playing: boolean } | null>(
		null,
	);
	useEffect(() => {
		registerPlayer(player);
		return () => registerPlayer(null);
	}, [player, registerPlayer]);
	const toggleAndFlash = () => {
		if (!player) return;
		const willPlay = !player.isPlaying();
		player.toggle();
		setFlash((f) => ({ key: (f?.key ?? 0) + 1, playing: willPlay }));
	};
	const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
		if (e.pointerType !== "mouse") return;
		leave();
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.key !== " " && e.key !== "Enter") return;
		e.preventDefault();
		toggleAndFlash();
	};
	return (
		<div
			className={`relative ${styles.player}`}
			onPointerMove={ping}
			onPointerDown={ping}
			onFocus={ping}
			onPointerLeave={handlePointerLeave}
		>
			<ToastErrorBoundary label="Player">
				<RemotionPlayer layout={layout} playerRef={setPlayer} />
			</ToastErrorBoundary>
			<button
				type="button"
				aria-label="Play or pause"
				onClick={toggleAndFlash}
				onKeyDown={handleKeyDown}
				className="absolute inset-0 cursor-pointer bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
			/>
			<PlayPauseFlash flash={flash} />
			<ActiveSceneSync player={player} layout={layout} segments={segments} />
			<PlayerControls
				player={player}
				layout={layout}
				segments={segments}
				visible={visible}
			/>
		</div>
	);
}

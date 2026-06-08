"use client";

import type { PlayerRef } from "@remotion/player";
import dynamic from "next/dynamic";
import { useEffect, useState, type Ref } from "react";
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
	return (
		<div
			className={`relative h-full w-full ${styles.player}`}
			onPointerMove={ping}
			onPointerDown={ping}
			onFocus={ping}
			onPointerLeave={leave}
		>
			<ToastErrorBoundary label="Player">
				<RemotionPlayer layout={layout} playerRef={setPlayer} />
			</ToastErrorBoundary>
			<div
				className="absolute inset-0 cursor-pointer"
				onClick={toggleAndFlash}
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

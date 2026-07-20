"use client";

import type { CallbackListener, PlayerRef } from "@remotion/player";
import dynamic from "next/dynamic";
import { useEffect, useState, type MutableRefObject, type Ref } from "react";
import type { VideoLayout } from "@/lib/video/types";
import { ToastErrorBoundary } from "../ToastErrorBoundary";
import { usePlayerControl } from "./PlayerControlContext";
import { PlayPauseFlash } from "./PlayPauseFlash";
import { useActiveSceneSync } from "./useActiveSceneSync";
import { usePreservedPlayhead } from "./usePreservedPlayhead";
import { useActiveSegmentIndex, useSceneSegments } from "./useSceneSegments";
import styles from "./VideoPlayer.module.css";

const fullSizeStyle = { width: "100%", height: "100%" };

const RemotionPlayer = dynamic(
	async () => {
		const [{ Player }, { VideoComposition }] = await Promise.all([
			import("@remotion/player"),
			import("@/remotion/compositions/VideoComposition"),
		]);

		function RemotionPlayerInner({
			layout,
			playerRef,
			controls,
		}: {
			layout: VideoLayout;
			playerRef: Ref<PlayerRef>;
			controls: boolean;
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
					style={fullSizeStyle}
					clickToPlay={false}
					controls={controls}
					acknowledgeRemotionLicense
					numberOfSharedAudioTags={10}
				/>
			);
		}

		return { default: RemotionPlayerInner };
	},
	{ ssr: false },
);

// Both of these track the playhead, so they stay siblings of the player rather
// than hooks inside it: @remotion/player is not memoized, and a re-render of it
// lands on the frame a transition is animating and the next asset is decoding.
function ActiveSceneTracker({
	player,
	fps,
}: {
	player: PlayerRef | null;
	fps: number;
}) {
	const segments = useSceneSegments();
	const activeIndex = useActiveSegmentIndex(player, segments, fps);
	useActiveSceneSync(player, segments, activeIndex);
	return null;
}

function ClickToPlayOverlay({ player }: { player: PlayerRef | null }) {
	const [flash, setFlash] = useState<{ key: number; playing: boolean } | null>(
		null,
	);
	const toggleAndFlash = () => {
		if (!player) return;
		const willPlay = !player.isPlaying();
		player.toggle();
		setFlash((f) => ({ key: (f?.key ?? 0) + 1, playing: willPlay }));
	};
	return (
		<>
			<div
				className="absolute inset-0 cursor-pointer"
				onClick={toggleAndFlash}
			/>
			<PlayPauseFlash flash={flash} />
		</>
	);
}

type VideoPreviewProps = {
	layout: VideoLayout;
	restoreFrameRef: MutableRefObject<number | null>;
};

export function VideoPreview({ layout, restoreFrameRef }: VideoPreviewProps) {
	const [player, setPlayer] = useState<PlayerRef | null>(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { registerPlayer } = usePlayerControl();
	useEffect(() => {
		registerPlayer(player);
		return () => registerPlayer(null);
	}, [player, registerPlayer]);
	usePreservedPlayhead(player, restoreFrameRef, layout.totalFrames);
	useEffect(() => {
		if (!player) return;
		const handler: CallbackListener<"fullscreenchange"> = (e) =>
			setIsFullscreen(e.detail.isFullscreen);
		player.addEventListener("fullscreenchange", handler);
		return () => player.removeEventListener("fullscreenchange", handler);
	}, [player]);
	return (
		<div className={`relative h-full w-full ${styles.player}`}>
			<ToastErrorBoundary label="Player">
				<RemotionPlayer
					layout={layout}
					playerRef={setPlayer}
					controls={isFullscreen}
				/>
			</ToastErrorBoundary>
			<ActiveSceneTracker player={player} fps={layout.fps} />
			<ClickToPlayOverlay player={player} />
		</div>
	);
}

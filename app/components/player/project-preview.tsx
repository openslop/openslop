"use client";

import type { CallbackListener, PlayerRef } from "@remotion/player";
import dynamic from "next/dynamic";
import { useEffect, useState, type Ref } from "react";
import { CaptionLineContext } from "@/components/captions/caption-line";
import type { RenderLayout } from "@/lib/render/types";
import { ToastErrorBoundary } from "../toast-error-boundary";
import { ActiveSceneSync } from "./active-scene-sync";
import { EditableCaptionLine } from "./editable-caption-line";
import { usePlayerControl } from "./player-control-context";
import { PlayPauseFlash } from "./play-pause-flash";
import styles from "./project-preview.module.css";

const fullSizeStyle = { width: "100%", height: "100%" };

const passThroughStyle = {
	...fullSizeStyle,
	pointerEvents: "none",
} as const;

const RemotionPlayer = dynamic(
	async () => {
		const [{ Player }, { VideoComposition }] = await Promise.all([
			import("@remotion/player"),
			import("@/remotion/compositions/video-composition"),
		]);

		function RemotionPlayerInner({
			layout,
			playerRef,
			controls,
		}: {
			layout: RenderLayout;
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
					style={controls ? fullSizeStyle : passThroughStyle}
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

export function ProjectPreview({ layout }: { layout: RenderLayout }) {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const { player, registerPlayer } = usePlayerControl();
	const [flash, setFlash] = useState<{ key: number; playing: boolean } | null>(
		null,
	);
	useEffect(() => {
		if (!player) return;
		const handler: CallbackListener<"fullscreenchange"> = ({ detail }) =>
			setIsFullscreen(detail.isFullscreen);
		player.addEventListener("fullscreenchange", handler);
		return () => player.removeEventListener("fullscreenchange", handler);
	}, [player]);
	const toggleAndFlash = () => {
		if (!player) return;
		const willPlay = !player.isPlaying();
		player.toggle();
		setFlash((prev) => ({ key: (prev?.key ?? 0) + 1, playing: willPlay }));
	};
	// Clicks pass through the video to the play button, except on a caption line.
	return (
		<div className={`relative h-full w-full ${styles.player}`}>
			<button
				type="button"
				aria-label="Play or pause"
				className="absolute inset-0 cursor-pointer focus-ring focus-visible:ring-inset"
				onClick={toggleAndFlash}
			/>
			<ToastErrorBoundary label="Player">
				<CaptionLineContext value={EditableCaptionLine}>
					<RemotionPlayer
						layout={layout}
						playerRef={registerPlayer}
						controls={isFullscreen}
					/>
				</CaptionLineContext>
			</ToastErrorBoundary>
			<PlayPauseFlash flash={flash} />
			<ActiveSceneSync />
		</div>
	);
}

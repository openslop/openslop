"use client";

import dynamic from "next/dynamic";
import type { VideoLayout } from "@/lib/video/types";
import { ToastErrorBoundary } from "../ToastErrorBoundary";
import styles from "./VideoPlayer.module.css";

const fullWidthStyle = { width: "100%" };

const RemotionPlayer = dynamic(
	async () => {
		const [{ Player }, { VideoComposition }] = await Promise.all([
			import("@remotion/player"),
			import("@/remotion/compositions/VideoComposition"),
		]);

		function RemotionPlayerInner({ layout }: { layout: VideoLayout }) {
			return (
				<Player
					component={VideoComposition}
					inputProps={layout}
					durationInFrames={layout.totalFrames}
					fps={layout.fps}
					compositionWidth={layout.width}
					compositionHeight={layout.height}
					style={fullWidthStyle}
					controls
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
	return (
		<div className={styles.player}>
			<ToastErrorBoundary label="Player">
				<RemotionPlayer layout={layout} />
			</ToastErrorBoundary>
		</div>
	);
}

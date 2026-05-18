import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { type MotionEffect, motionTransform } from "@/lib/video/motionEffects";

const clip: React.CSSProperties = { overflow: "hidden" };

export function MotionLayer({
	effect,
	durationInFrames,
	children,
}: {
	effect: MotionEffect;
	durationInFrames: number;
	children: ReactNode;
}) {
	const frame = useCurrentFrame();
	const { width, height } = useVideoConfig();
	if (effect === "none") return <>{children}</>;
	const aspectRatio = Math.max(width, height) / Math.min(width, height);
	const transform = motionTransform(
		effect,
		frame,
		durationInFrames,
		aspectRatio,
	);
	return (
		<AbsoluteFill style={clip}>
			<AbsoluteFill
				style={{
					transform,
					transformOrigin: "center",
					willChange: "transform",
				}}
			>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
}

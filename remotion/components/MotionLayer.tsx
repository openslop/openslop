import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { motionTransform } from "@/lib/video/motionEffects";
import type { MotionEffect } from "@/lib/video/motionEffectNames";

const clip: React.CSSProperties = { overflow: "hidden" };

export function MotionLayer({
	effect,
	children,
}: {
	effect: MotionEffect;
	children: ReactNode;
}) {
	const frame = useCurrentFrame();
	const { durationInFrames, width, height } = useVideoConfig();
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

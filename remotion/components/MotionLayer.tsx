import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
	type ActiveMotionEffect,
	type MotionEffect,
	motionTransform,
} from "@/lib/video/motionEffects";

const clip: React.CSSProperties = { overflow: "hidden" };

function AnimatedMotionLayer({
	effect,
	children,
}: {
	effect: ActiveMotionEffect;
	children: ReactNode;
}) {
	const frame = useCurrentFrame();
	const { durationInFrames, width, height } = useVideoConfig();
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

export function MotionLayer({
	effect,
	children,
}: {
	effect: MotionEffect;
	children: ReactNode;
}) {
	if (effect === "none") return <>{children}</>;
	return <AnimatedMotionLayer effect={effect}>{children}</AnimatedMotionLayer>;
}

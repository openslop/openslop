"use client";

import { Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { usePlayerControl } from "@/app/components/video/PlayerControlContext";
import { findSceneSequence } from "@/app/components/video/useSceneSegments";
import { useLayout } from "@/app/components/video/VideoLayoutContext";
import type { SceneElement } from "@/lib/canvas/types";
import { toFrames } from "@/lib/video/frames";

export function PlayFromHereButton({ scene }: { scene: SceneElement }) {
	const { layout } = useLayout();
	const { playFromFrame } = usePlayerControl();
	const seq = findSceneSequence(scene, layout);
	const startFrame = seq && layout ? toFrames(seq.start, layout.fps) : null;
	const disabled = startFrame == null;
	return (
		<TooltipIconButton
			label={disabled ? "Generate scene to play" : "Play from here"}
			ariaLabel="Play from here"
			className="bg-muted"
			disabled={disabled}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => {
				if (startFrame != null) playFromFrame(startFrame);
			}}
		>
			<Play className="h-4 w-4" />
		</TooltipIconButton>
	);
}

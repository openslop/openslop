"use client";

import { Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { usePlayerControl } from "@/app/components/player/player-control-context";
import {
	useLayout,
	useSceneSequence,
} from "@/app/components/player/render-layout-context";
import type { Scene } from "@/lib/canvas/types";
import { toFrames } from "@/lib/render/frames";

export function PlayFromHereButton({ scene }: { scene: Scene }) {
	const { layout } = useLayout();
	const { playFromFrame } = usePlayerControl();
	const seq = useSceneSequence(scene);
	const startFrame = seq ? toFrames(seq.start, layout.fps) : null;
	const unavailable = startFrame == null;
	return (
		<TooltipIconButton
			label={unavailable ? "Generate scene to play" : "Play from here"}
			ariaLabel="Play from here"
			chip
			unavailable={unavailable}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => {
				if (startFrame != null) playFromFrame(startFrame);
			}}
		>
			<Play />
		</TooltipIconButton>
	);
}

"use client";

import { Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { usePlayerControl } from "@/app/components/player/PlayerControlContext";
import {
	useLayout,
	useSceneSequence,
} from "@/app/components/player/RenderLayoutContext";
import type { SceneElement } from "@/lib/canvas/types";
import { toFrames } from "@/lib/render/frames";

export function PlayFromHereButton({ scene }: { scene: SceneElement }) {
	const { layout } = useLayout();
	const { playFromFrame } = usePlayerControl();
	const seq = useSceneSequence(scene);
	const startFrame = seq ? toFrames(seq.start, layout.fps) : null;
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

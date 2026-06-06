"use client";

import { Play } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerControl } from "@/app/components/video/PlayerControlContext";
import { findSceneSequence } from "@/app/components/video/useSceneSegments";
import { useLayout } from "@/app/components/video/VideoLayoutContext";
import type { SceneElement } from "@/lib/canvas/types";
import styles from "./PlayFromHereButton.module.css";

export function PlayFromHereButton({ scene }: { scene: SceneElement }) {
	const { layout } = useLayout();
	const { playFromFrame } = usePlayerControl();
	const seq = findSceneSequence(scene, layout);
	const startFrame = seq && layout ? Math.round(seq.start * layout.fps) : null;
	const disabled = startFrame == null;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Play from here"
					disabled={disabled}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => {
						if (startFrame != null) playFromFrame(startFrame);
					}}
					className={styles.button}
				>
					<Play className={styles.icon} />
				</button>
			</TooltipTrigger>
			<TooltipContent>
				{disabled ? "Generate scene to play" : "Play from here"}
			</TooltipContent>
		</Tooltip>
	);
}

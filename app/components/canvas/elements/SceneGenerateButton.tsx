"use client";

import { Sparkles } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import type { SceneElement } from "@/lib/canvas/types";
import { useGenerateElements } from "../hooks/useGenerateElements";

export function SceneGenerateButton({ scene }: { scene: SceneElement }) {
	const generateElements = useGenerateElements();

	return (
		<TooltipIconButton
			label="Generate scene"
			className="bg-muted"
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => generateElements(scene.children)}
		>
			<Sparkles className="h-4 w-4" />
		</TooltipIconButton>
	);
}

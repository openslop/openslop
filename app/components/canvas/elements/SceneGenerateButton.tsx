"use client";

import { useCallback } from "react";
import { Check, RotateCcw, Sparkles } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import type { SceneElement } from "@/lib/canvas/types";
import {
	useGenerateScope,
	type GenerateCounts,
} from "../hooks/useGenerateScope";

function SceneGenerateIcon({ empty, active, pending, stale }: GenerateCounts) {
	if (active) return <Spinner className="h-4 w-4 text-current" />;
	if (empty) return <Sparkles className="h-4 w-4" />;
	if (pending === 0) return <Check className="h-4 w-4" />;
	if (stale === pending) return <RotateCcw className="h-4 w-4" />;
	return <Sparkles className="h-4 w-4" />;
}

export function SceneGenerateButton({ scene }: { scene: SceneElement }) {
	const select = useCallback(() => scene.children, [scene.children]);
	const scope = useGenerateScope(select, "scene");
	const unavailable = scope.empty || scope.active || scope.pending === 0;

	return (
		<TooltipIconButton
			label={scope.description}
			className="bg-muted"
			unavailable={unavailable}
			onMouseDown={(e) => e.preventDefault()}
			onClick={scope.run}
		>
			<SceneGenerateIcon {...scope} />
		</TooltipIconButton>
	);
}

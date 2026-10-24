"use client";

import { useCallback } from "react";
import { Check, RotateCcw, Sparkles } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { keepFocus } from "@/components/ui/keep-focus";
import { Spinner } from "@/components/ui/spinner";
import type { Scene } from "@/lib/canvas/types";
import {
	useGenerateScope,
	type GenerateCounts,
} from "../hooks/use-generate-scope";

function SceneGenerateIcon({ empty, active, pending, stale }: GenerateCounts) {
	if (active) return <Spinner className="h-4 w-4 text-current" />;
	if (empty) return <Sparkles />;
	if (pending === 0) return <Check />;
	if (stale === pending) return <RotateCcw />;
	return <Sparkles />;
}

export function SceneGenerateButton({ scene }: { scene: Scene }) {
	const select = useCallback(() => scene.children, [scene.children]);
	const scope = useGenerateScope(select, "scene");
	const unavailable = scope.empty || scope.active || scope.pending === 0;

	return (
		<TooltipIconButton
			label={scope.description}
			chip
			unavailable={unavailable}
			onMouseDown={keepFocus}
			onClick={scope.run}
		>
			<SceneGenerateIcon {...scope} />
		</TooltipIconButton>
	);
}

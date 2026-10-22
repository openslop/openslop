"use client";

import { useCallback } from "react";
import { Check, RotateCcw, Sparkles } from "@/components/ui/icon";
import { LOOKS, TooltipIconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import type { Scene } from "@/lib/canvas/types";
import {
	useGenerateScope,
	type GenerateCounts,
} from "../hooks/use-generate-scope";

function SceneGenerateIcon({
	empty,
	active,
	pending,
	stale,
	size,
}: GenerateCounts & { size: number }) {
	if (active) return <Spinner className="h-4 w-4 text-current" />;
	if (empty) return <Sparkles size={size} />;
	if (pending === 0) return <Check size={size} />;
	if (stale === pending) return <RotateCcw size={size} />;
	return <Sparkles size={size} />;
}

export function SceneGenerateButton({ scene }: { scene: Scene }) {
	const select = useCallback(() => scene.children, [scene.children]);
	const scope = useGenerateScope(select, "scene");
	const unavailable = scope.empty || scope.active || scope.pending === 0;
	const { icon, chip } = LOOKS.default;

	return (
		<TooltipIconButton
			label={scope.description}
			className={chip}
			unavailable={unavailable}
			onMouseDown={(e) => e.preventDefault()}
			onClick={scope.run}
		>
			<SceneGenerateIcon {...scope} size={icon} />
		</TooltipIconButton>
	);
}

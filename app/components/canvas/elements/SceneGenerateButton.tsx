"use client";

import { RotateCcw, Sparkles } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import type { SceneElement } from "@/lib/canvas/types";
import {
	useGenerateScope,
	type GenerateScope,
} from "../hooks/useGenerateScope";

const elements = (count: number) =>
	`${count} ${count === 1 ? "element" : "elements"}`;

function tooltip({ empty, active, pending, total }: GenerateScope): string {
	if (empty) return "Add a prompt to generate this scene";
	if (active) return "Generating this scene…";
	if (pending === 0) return `Regenerate all ${elements(total)} in this scene`;
	if (pending === total) return `Generate ${elements(total)} in this scene`;
	return `Generate ${pending} of ${elements(total)} in this scene`;
}

function action({ active, pending }: GenerateScope): string {
	if (active) return "Generating scene";
	return pending === 0 ? "Regenerate scene" : "Generate scene";
}

function Icon({ active, pending, total }: GenerateScope) {
	if (active) return <Spinner className="h-4 w-4 text-current" />;
	if (pending === 0) return <RotateCcw className="h-4 w-4" />;
	return (
		<span className="relative">
			<Sparkles className="h-4 w-4" />
			{pending < total && (
				<span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-tertiary" />
			)}
		</span>
	);
}

export function SceneGenerateButton({ scene }: { scene: SceneElement }) {
	const scope = useGenerateScope(scene.children);
	const unavailable = scope.empty || scope.active;
	const run = scope.pending === 0 ? scope.regenerate : scope.generate;

	return (
		<TooltipIconButton
			label={tooltip(scope)}
			ariaLabel={action(scope)}
			className="bg-muted aria-disabled:opacity-40"
			// Hoverable rather than `disabled`, so the tooltip can say why.
			aria-disabled={unavailable || undefined}
			onMouseDown={(e) => e.preventDefault()}
			onClick={unavailable ? undefined : run}
		>
			<Icon {...scope} />
		</TooltipIconButton>
	);
}

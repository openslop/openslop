"use client";

import { AlertCircle, Sparkles } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { useGenerate } from "../hooks/useGenerate";

export function StaleIndicator() {
	return (
		<SimpleTooltip label="Prompt changed — regenerate to update">
			<span className="inline-flex items-center gap-1 rounded-full border border-tertiary/50 bg-tertiary/10 px-2 py-0.5 text-[11px] font-medium text-tertiary">
				<AlertCircle className="h-3 w-3" />
				Stale
			</span>
		</SimpleTooltip>
	);
}

export function GenerateButton({
	label,
	disabled,
	onGenerate,
}: {
	label: string;
	disabled: boolean;
	onGenerate: () => void;
}) {
	return (
		<SimpleTooltip label={label}>
			<button
				type="button"
				aria-label={label}
				disabled={disabled}
				onMouseDown={(e) => e.preventDefault()}
				onClick={onGenerate}
				className={cn(
					"inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors enabled:hover:bg-generate-hover disabled:cursor-not-allowed",
					disabled
						? "bg-generate-disabled text-generate-disabled-foreground"
						: "bg-generate text-generate-foreground",
				)}
			>
				<Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
			</button>
		</SimpleTooltip>
	);
}

export function ElementGenerateButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { hasPrompt, hasResult, stale, status, generate } =
		useGenerate(element);
	return (
		<div className="flex items-center gap-2">
			{stale && hasResult && <StaleIndicator />}
			<GenerateButton
				label="Generate"
				disabled={!hasPrompt || status !== "idle"}
				onGenerate={generate}
			/>
		</div>
	);
}

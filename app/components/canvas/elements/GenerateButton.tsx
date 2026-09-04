"use client";

import type { ReactNode } from "react";
import { AlertCircle, Hourglass, Sparkles } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	isGenerationActive,
	type GenerationStatus,
} from "@/lib/generation/snapshots";
import { useElementGeneration } from "./ElementGenerationContext";

export function StaleIndicator({ reason }: { reason: string }) {
	return (
		<SimpleTooltip label={reason}>
			<Badge variant="tertiary" className="text-label-xs">
				<AlertCircle />
				Stale
			</Badge>
		</SimpleTooltip>
	);
}

export function ElementStaleIndicator() {
	const { staleReason } = useElementGeneration();
	if (!staleReason) return null;
	return <StaleIndicator reason={staleReason} />;
}

const GENERATE_ICON: Record<GenerationStatus, ReactNode> = {
	generating: <Spinner className="text-current" />,
	queued: <Hourglass aria-hidden="true" />,
	idle: <Sparkles aria-hidden="true" />,
};

function generateLabel(status: GenerationStatus, hasResult: boolean) {
	if (status === "generating") return "Generating…";
	if (status === "queued") return "Queued";
	return hasResult ? "Regenerate" : "Generate";
}

export function GenerateButton({
	status,
	hasResult,
	disabled,
	onGenerate,
}: {
	status: GenerationStatus;
	hasResult: boolean;
	disabled: boolean;
	onGenerate: () => void;
}) {
	const label = generateLabel(status, hasResult);
	return (
		<Button
			type="button"
			variant="generate"
			size="sm"
			className="shrink-0"
			disabled={disabled}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onGenerate}
			aria-label={label}
			tooltip={hasResult ? "Regenerate this element" : "Generate this element"}
		>
			{GENERATE_ICON[status]}
			{label}
		</Button>
	);
}

export function ElementGenerateButton() {
	const { hasPrompt, hasResult, status, generate } = useElementGeneration();
	return (
		<GenerateButton
			status={status}
			hasResult={hasResult}
			disabled={!hasPrompt || isGenerationActive(status)}
			onGenerate={generate}
		/>
	);
}

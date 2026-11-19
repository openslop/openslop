"use client";

import type { ReactNode } from "react";
import { AlertCircleFilled, Hourglass, Sparkles } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ADD_PROMPT } from "@/lib/components/unavailable-reasons";
import {
	isGenerationActive,
	type GenerationStatus,
} from "@/lib/generation/snapshots";
import { ElementActionButton } from "./element-action-button";
import { useElementGeneration } from "./element-generation-context";

export function StaleIndicator({ reason }: { reason: string }) {
	return (
		<SimpleTooltip label={reason}>
			<Badge variant="indicator" size="xs">
				<AlertCircleFilled />
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
	generating: <Spinner />,
	queued: <Hourglass />,
	idle: <Sparkles />,
};

function generateLabel(status: GenerationStatus, hasResult: boolean) {
	if (status === "generating") return "Generating…";
	if (status === "queued") return "Queued";
	return hasResult ? "Regenerate" : "Generate";
}

export function GenerateButton({
	status,
	hasResult,
	unavailable,
	onGenerate,
	className,
	tooltip,
}: {
	status: GenerationStatus;
	hasResult: boolean;
	unavailable: boolean;
	onGenerate: () => void;
	className?: string;
	tooltip?: string;
}) {
	const label = generateLabel(status, hasResult);
	return (
		<ElementActionButton
			icon={GENERATE_ICON[status]}
			label={label}
			variant="generate"
			className={className}
			unavailable={unavailable}
			onClick={onGenerate}
			aria-label={label}
			tooltip={
				tooltip ??
				(hasResult ? "Regenerate this element" : "Generate this element")
			}
		/>
	);
}

export function ElementGenerateButton() {
	const { hasPrompt, hasResult, status, generate } = useElementGeneration();
	return (
		<GenerateButton
			status={status}
			hasResult={hasResult}
			unavailable={!hasPrompt || isGenerationActive(status)}
			tooltip={hasPrompt ? undefined : ADD_PROMPT}
			onGenerate={generate}
		/>
	);
}

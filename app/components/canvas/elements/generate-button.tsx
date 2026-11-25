"use client";

import type { ReactNode } from "react";
import { AlertCircleFilled, Hourglass, Sparkles } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
				<span aria-hidden="true">Stale</span>
				<span className="sr-only">Stale: {reason}</span>
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

function generateTooltip(
	hasPrompt: boolean,
	hasResult: boolean,
	queuedReason: string | null | undefined,
) {
	if (queuedReason) return queuedReason;
	if (!hasPrompt) return "Add a prompt first";
	return hasResult ? "Regenerate this element" : "Generate this element";
}

export function GenerateButton({
	status,
	hasPrompt,
	hasResult,
	queuedReason,
	onGenerate,
	className,
}: {
	status: GenerationStatus;
	hasPrompt: boolean;
	hasResult: boolean;
	queuedReason?: string | null;
	onGenerate: () => void;
	className?: string;
}) {
	const label = generateLabel(status, hasResult);
	return (
		<ElementActionButton
			icon={GENERATE_ICON[status]}
			label={label}
			variant="generate"
			className={className}
			unavailable={!hasPrompt || isGenerationActive(status)}
			onClick={onGenerate}
			tooltip={generateTooltip(hasPrompt, hasResult, queuedReason)}
		/>
	);
}

export function ElementGenerateButton() {
	const { hasPrompt, hasResult, status, queuedReason, generate } =
		useElementGeneration();
	return (
		<GenerateButton
			status={status}
			hasPrompt={hasPrompt}
			hasResult={hasResult}
			queuedReason={queuedReason}
			onGenerate={generate}
		/>
	);
}

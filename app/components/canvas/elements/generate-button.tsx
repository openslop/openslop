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
import { usePendingUploadsSelector } from "@/lib/upload/pending-uploads-provider";
import { useElementGeneration } from "./element-generation-context";

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

function generateLabel(
	status: GenerationStatus,
	hasResult: boolean,
	uploading: boolean,
) {
	if (status === "generating") return "Generating…";
	if (status === "queued") return "Queued";
	if (uploading) return "Uploading…";
	return hasResult ? "Regenerate" : "Generate";
}

function generateTooltip(hasResult: boolean, uploading: boolean) {
	if (uploading) return "Waiting for an upload to finish";
	return hasResult ? "Regenerate this element" : "Generate this element";
}

export function GenerateButton({
	status,
	hasResult,
	uploading,
	disabled,
	onGenerate,
}: {
	status: GenerationStatus;
	hasResult: boolean;
	uploading: boolean;
	disabled: boolean;
	onGenerate: () => void;
}) {
	const label = generateLabel(status, hasResult, uploading);
	return (
		<Button
			type="button"
			variant="generate"
			size="sm"
			className="shrink-0"
			disabled={disabled}
			unavailable={uploading}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onGenerate}
			aria-label={label}
			tooltip={generateTooltip(hasResult, uploading)}
		>
			{GENERATE_ICON[status]}
			{label}
		</Button>
	);
}

export function ElementGenerateButton() {
	const { node, hasPrompt, hasResult, status, generate } =
		useElementGeneration();
	const uploading = usePendingUploadsSelector((uploads) =>
		uploads.blocks(node.id),
	);
	return (
		<GenerateButton
			status={status}
			hasResult={hasResult}
			uploading={uploading}
			disabled={!hasPrompt || isGenerationActive(status)}
			onGenerate={generate}
		/>
	);
}

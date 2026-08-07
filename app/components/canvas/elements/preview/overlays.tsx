import { useEffect, useRef, useState } from "react";
import { X as XIcon, AlertCircle, Check, Copy } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { GenerationIndicator } from "../GenerationIndicator";
import type { GenerationState, PlaceholderProps } from "./status";

/**
 * Vertical offset is inherited from `--cancel-offset`, so a placeholder whose
 * top-right corner is already occupied moves the button by setting that token
 * on its own container instead of threading a class down the preview tree.
 */
function CancelButton({ onClick }: { onClick: () => void }) {
	return (
		<SimpleTooltip label="Cancel generation">
			<button
				type="button"
				aria-label="Cancel generation"
				className="absolute right-2 top-[var(--cancel-offset,0.5rem)] z-10 w-6 h-6 rounded-full bg-muted hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
				onClick={onClick}
			>
				<XIcon className="w-3 h-3 text-foreground" />
			</button>
		</SimpleTooltip>
	);
}

export function ResultOverlay({ status, seconds }: GenerationState) {
	if (!isGenerationActive(status)) return null;
	return (
		<GenerationIndicator
			status={status}
			seconds={seconds}
			className="absolute top-2 left-2 z-10"
		/>
	);
}

export function ErrorMessage({ message }: { message: string }) {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(message);
		} catch (e) {
			console.error("Failed to copy error message:", e);
			return;
		}
		setCopied(true);
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setCopied(false), 1500);
	};
	return (
		<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-12 py-2">
			<div className="pointer-events-auto flex max-h-full max-w-full items-start gap-1.5 overflow-auto rounded-lg bg-destructive px-3 py-1.5 shadow-md">
				<AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-destructive-foreground" />
				<p className="min-w-0 whitespace-pre-wrap break-words text-label leading-snug text-destructive-foreground">
					{message}
				</p>
				<button
					type="button"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy error message"}
					className="mt-px shrink-0 rounded text-destructive-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-border"
				>
					{copied ? (
						<Check className="h-3.5 w-3.5" />
					) : (
						<Copy className="h-3.5 w-3.5" />
					)}
				</button>
			</div>
		</div>
	);
}

export function PlaceholderOverlay({
	status,
	seconds,
	error,
	onDiscard,
}: PlaceholderProps) {
	return (
		<>
			{error && <ErrorMessage message={error} />}
			{isGenerationActive(status) && (
				<>
					<div className="absolute top-2 left-2 z-10">
						<GenerationIndicator status={status} seconds={seconds} />
					</div>
					<CancelButton onClick={onDiscard} />
				</>
			)}
		</>
	);
}

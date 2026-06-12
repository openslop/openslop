import { useEffect, useRef, useState } from "react";
import { X as XIcon, AlertCircle, Check, Copy } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { GenerationIndicator } from "../GenerationIndicator";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { GenerationInputs } from "@/lib/generation/generationInputs";
import type { GenerationState, PlaceholderProps } from "./status";

function OverlayButton({
	onClick,
	label,
	className = "top-2",
	children,
}: {
	onClick: () => void;
	label: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					className={`absolute right-2 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${className}`}
					onClick={onClick}
				>
					{children}
				</button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

function CancelButton({
	onClick,
	className = "top-2",
}: {
	onClick: () => void;
	className?: string;
}) {
	return (
		<OverlayButton
			onClick={onClick}
			label="Cancel generation"
			className={className}
		>
			<XIcon className="w-3 h-3 text-white" />
		</OverlayButton>
	);
}

function StaleBadge({ onClick }: { onClick: () => void }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1 rounded-full bg-amber-500/80 px-2 py-1 text-[10px] font-medium text-white transition-opacity hover:bg-amber-500"
					onClick={onClick}
				>
					<AlertCircle className="w-3 h-3" />
					Stale
				</button>
			</TooltipTrigger>
			<TooltipContent>Prompt changed — click to regenerate</TooltipContent>
		</Tooltip>
	);
}

export function StaleIndicator({ onClick }: { onClick: () => void }) {
	return (
		<div className="absolute bottom-2 right-2 z-10">
			<StaleBadge onClick={onClick} />
		</div>
	);
}

export function StaleControls({
	elementId,
	onRegenerate,
	onRevert,
}: {
	elementId: string;
	onRegenerate: () => void;
	onRevert?: (resultInputs: GenerationInputs) => void;
}) {
	const resultInputs = useQueueSelector(
		(q) => q.getElementSnapshot(elementId).resultInputs,
	);
	return (
		<div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
			{onRevert && resultInputs && (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => onRevert(resultInputs)}
							className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/80 ring-1 ring-inset ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 hover:text-white"
						>
							Revert
						</button>
					</TooltipTrigger>
					<TooltipContent>
						Discard edits — restore what this was generated from
					</TooltipContent>
				</Tooltip>
			)}
			<StaleBadge onClick={onRegenerate} />
		</div>
	);
}

export function ResultOverlay({
	status,
	seconds,
	onRegenerate,
}: GenerationState & {
	onRegenerate: () => void;
}) {
	return (
		<GenerationIndicator
			status={status}
			seconds={seconds}
			idleLabel="Regenerate"
			onClick={onRegenerate}
			className="absolute top-2 left-2 z-10"
		/>
	);
}

function ErrorMessage({ message }: { message: string }) {
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
			<div className="pointer-events-auto flex max-h-full max-w-full items-start gap-1.5 overflow-auto rounded-lg bg-red-700 px-3 py-1.5 shadow-md">
				<AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-white" />
				<p className="min-w-0 whitespace-pre-wrap break-words text-xs leading-snug text-white">
					{message}
				</p>
				<button
					type="button"
					onClick={handleCopy}
					aria-label={copied ? "Copied" : "Copy error message"}
					className="mt-px shrink-0 rounded text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
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
	onGenerate,
	onDiscard,
	cancelClassName,
}: PlaceholderProps & { cancelClassName?: string }) {
	return (
		<>
			{error && <ErrorMessage message={error} />}
			<div className="absolute top-2 left-2 z-10">
				<GenerationIndicator
					status={status}
					seconds={seconds}
					idleLabel="Generate"
					onClick={onGenerate}
				/>
			</div>
			{status !== "idle" && (
				<CancelButton onClick={onDiscard} className={cancelClassName} />
			)}
		</>
	);
}

import { X, AlertCircle } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/copy-button";
import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { GenerationIndicator } from "../generation-indicator";
import type {
	GenerationState,
	PlaceholderProps,
	PreviewOverlays,
} from "./status";

/**
 * Vertical offset is inherited from `--cancel-offset`, so a placeholder whose
 * top-right corner is already occupied moves the button by setting that token
 * on its own container instead of threading a class down the preview tree.
 */
function CancelButton({ onClick }: { onClick: () => void }) {
	return (
		<SimpleTooltip label="Cancel generation">
			<IconButton
				ariaLabel="Cancel generation"
				shape="round"
				size="sm"
				chip
				className="absolute right-2 top-(--cancel-offset,0.5rem) z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
				onClick={onClick}
			>
				<X />
			</IconButton>
		</SimpleTooltip>
	);
}

/**
 * Sits above every other overlay so its controls stay clickable through an
 * error message, and wraps rather than overflows on a narrow card.
 */
export function PreviewChrome({ topRight }: PreviewOverlays) {
	return (
		<div className="absolute right-2 top-2 z-30 flex flex-wrap items-center justify-end gap-1.5 empty:hidden">
			{topRight}
		</div>
	);
}

export function ResultOverlay({
	status,
	startedAt,
	queuedReason,
}: GenerationState) {
	if (!isGenerationActive(status)) return null;
	return (
		<GenerationIndicator
			status={status}
			startedAt={startedAt}
			queuedReason={queuedReason}
			className="absolute top-2 left-2 z-10"
		/>
	);
}

export function ErrorMessage({ message }: { message: string }) {
	return (
		<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-12 py-2">
			<div className="pointer-events-auto flex max-h-full max-w-full items-start gap-1.5 overflow-auto rounded-lg bg-destructive px-3 py-1.5 text-destructive-foreground shadow-elevation-1">
				<AlertCircle className="mt-px h-3.5 w-3.5" />
				<p className="min-w-0 whitespace-pre-wrap wrap-break-word text-label leading-snug">
					{message}
				</p>
				<CopyButton
					text={message}
					label="Copy error message"
					variant="inherit"
					size="sm"
				/>
			</div>
		</div>
	);
}

export function PlaceholderOverlay({
	status,
	startedAt,
	queuedReason,
	error,
	onDiscard,
}: PlaceholderProps) {
	return (
		<>
			{error && <ErrorMessage message={error} />}
			{isGenerationActive(status) && (
				<>
					<div className="absolute top-2 left-2 z-10">
						<GenerationIndicator
							status={status}
							startedAt={startedAt}
							queuedReason={queuedReason}
						/>
					</div>
					<CancelButton onClick={onDiscard} />
				</>
			)}
		</>
	);
}

"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "@/components/ui/icon";
import { CloseButton } from "@/components/ui/close-button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { formatBytes } from "@/lib/format";

const cardClass =
	"flex w-[320px] items-center gap-3 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-elevation-5";

const viewButtonClass =
	"shrink-0 rounded-md px-2 py-1 text-label font-medium text-accent transition-colors hover:bg-button-hover";

export function ExportProgressToast({
	progress,
	onView,
}: {
	progress: number;
	onView: () => void;
}) {
	return (
		<div className={cardClass}>
			<Spinner className="text-muted-foreground" />
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<span className="text-label font-medium">Exporting video…</span>
				<Progress value={progress * 100} />
			</div>
			<button type="button" onClick={onView} className={viewButtonClass}>
				View
			</button>
		</div>
	);
}

export function ExportDoneToast({
	url,
	size,
	toastId,
	onView,
}: {
	url: string;
	size: number;
	toastId: string | number;
	onView: () => void;
}) {
	return (
		<div className={cardClass}>
			<div className="flex min-w-0 flex-1 flex-col">
				<button
					type="button"
					onClick={onView}
					className="text-left text-label font-medium hover:underline"
				>
					Export ready
				</button>
				<span className="text-label text-muted-foreground">
					{formatBytes(size)}
				</span>
			</div>
			<Button asChild variant="generate" size="sm">
				<a href={url} download onClick={() => toast.dismiss(toastId)}>
					<Download size={14} />
					Download
				</a>
			</Button>
			<CloseButton
				onClick={() => toast.dismiss(toastId)}
				size={14}
				className="shrink-0"
			/>
		</div>
	);
}

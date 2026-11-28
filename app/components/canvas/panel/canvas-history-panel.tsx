"use client";

import { useEffect } from "react";
import { UserAvatar } from "@/app/components/user-avatar";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, RotateCcw } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import {
	useCanvasHistory,
	useCanvasHistoryState,
} from "@/lib/project/canvas-history-provider";
import type { CanvasVersion } from "@/lib/project/canvas-history";
import { relativeTime } from "@/lib/project/relative-time";
import { toastError } from "@/lib/toast-error";
import { useUser } from "@/lib/user/user-provider";
import { cn } from "@/lib/utils";

const SKELETON_ROWS = [0, 1, 2];

function CanvasVersionRow({
	version,
	previewing,
	onView,
	onRestore,
}: {
	version: CanvasVersion;
	previewing: boolean;
	onView: () => void;
	onRestore: () => void;
}) {
	const user = useUser();
	const generating = useQueueSelector((q) => q.isBusy());

	return (
		<li
			aria-current={previewing ? "true" : undefined}
			className={cn(
				"group grain relative shrink-0 overflow-hidden rounded-xl bg-element-card shadow-elevation-1",
				previewing && "ring-2 ring-accent",
			)}
		>
			<div className="relative z-10 flex items-center gap-2.5 p-3 text-panel-fg">
				<UserAvatar user={user} size="sm" />
				<div className="flex min-w-0 flex-1 flex-col">
					<time dateTime={version.updatedAt} className="truncate text-label-xs">
						{formatDateTime(version.updatedAt)}
					</time>
					<span className="truncate text-label-xs text-muted-foreground">
						{relativeTime(version.updatedAt)}
					</span>
				</div>
				{previewing ? (
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={onRestore}
					>
						<RotateCcw />
						Restore
					</Button>
				) : (
					<Button
						type="button"
						variant="secondary"
						size="sm"
						aria-label="View"
						tooltip={
							generating
								? "Wait for generation to finish"
								: "Show this version on the canvas"
						}
						unavailable={generating}
						onClick={onView}
						className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
					>
						<Eye />
						View
					</Button>
				)}
			</div>
		</li>
	);
}

function LoadingRows() {
	return (
		<div aria-busy="true" className="flex flex-col gap-3">
			<span className="sr-only">Loading history…</span>
			{SKELETON_ROWS.map((row) => (
				<Skeleton key={row} className="h-14 rounded-xl" />
			))}
		</div>
	);
}

export function CanvasHistoryPanel() {
	const history = useCanvasHistory();
	const { versions, status, previewId } = useCanvasHistoryState();

	useEffect(() => {
		void history.load();
	}, [history]);

	if (status === "failed")
		return (
			<div className="flex flex-col items-start gap-2">
				<p
					role="alert"
					className="flex items-center gap-1.5 text-label-xs text-destructive"
				>
					<AlertCircle className="h-3.5 w-3.5" />
					Could not load history.
				</p>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => void history.load()}
				>
					Try again
				</Button>
			</div>
		);

	if (status === "loading") return <LoadingRows />;

	if (versions.length === 0)
		return (
			<p className="text-label-xs text-muted-foreground">
				No versions yet. Your edits are saved here as you work.
			</p>
		);

	return (
		<ul className="flex flex-col gap-3">
			{versions.map((version) => (
				<CanvasVersionRow
					key={version.id}
					version={version}
					previewing={version.id === previewId}
					onView={() =>
						history.preview(version.id).catch((error: unknown) => {
							toastError(error, "Opening this version failed");
						})
					}
					onRestore={history.restore}
				/>
			))}
		</ul>
	);
}

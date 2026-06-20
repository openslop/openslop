"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function StaleAvatarCloseDialog({
	open,
	onOpenChange,
	characterName,
	onLeaveStale,
	onRegenerate,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	characterName: string;
	onLeaveStale: () => void;
	onRegenerate: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogTitle>Avatar is out of date</AlertDialogTitle>
				<AlertDialogDescription>
					{characterName}&apos;s avatar no longer matches its current inputs.
					Your edits are already saved.
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-md px-2.5 py-1 text-label text-muted-foreground transition-colors hover:text-foreground">
						Keep editing
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onLeaveStale}
						className="rounded-md border border-border px-2.5 py-1 text-label text-muted-foreground transition-colors hover:bg-muted"
					>
						Leave stale
					</AlertDialogAction>
					<AlertDialogAction
						onClick={onRegenerate}
						className="rounded-md bg-accent px-3 py-1 text-label font-medium text-foreground shadow-elevation-5 transition hover:brightness-110"
					>
						Regenerate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

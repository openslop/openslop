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
					<AlertDialogCancel>Keep editing</AlertDialogCancel>
					<AlertDialogAction variant="outline" onClick={onLeaveStale}>
						Leave stale
					</AlertDialogAction>
					<AlertDialogAction onClick={onRegenerate}>
						Regenerate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

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
					<AlertDialogCancel className="rounded-md px-2.5 py-1 text-[12px] text-white/60 transition-colors hover:text-white">
						Keep editing
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onLeaveStale}
						className="rounded-md border border-white/10 px-2.5 py-1 text-[12px] text-white/70 transition-colors hover:bg-white/10"
					>
						Leave stale
					</AlertDialogAction>
					<AlertDialogAction
						onClick={onRegenerate}
						className="rounded-md bg-accent-violet px-3 py-1 text-[12px] font-medium text-white shadow-glow transition hover:brightness-110"
					>
						Regenerate
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

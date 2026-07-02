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

/** Confirmation gate for deletions the app cannot undo. */
export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	actionLabel,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	actionLabel: string;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogTitle>{title}</AlertDialogTitle>
				<AlertDialogDescription>{description}</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-md px-2.5 py-1 text-label text-muted-foreground transition-colors hover:text-foreground">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="rounded-md bg-destructive px-3 py-1 text-label font-medium text-destructive-foreground shadow-elevation-5 transition hover:brightness-110"
					>
						{actionLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

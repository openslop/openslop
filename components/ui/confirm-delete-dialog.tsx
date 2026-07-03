"use client";

import { useState } from "react";
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
	// Radix keeps the dialog mounted through its exit animation; latch the
	// content so it doesn't flash cleared values after the caller resets state.
	const [latched, setLatched] = useState({ title, description, actionLabel });
	if (
		open &&
		(latched.title !== title ||
			latched.description !== description ||
			latched.actionLabel !== actionLabel)
	) {
		setLatched({ title, description, actionLabel });
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogTitle>{latched.title}</AlertDialogTitle>
				<AlertDialogDescription>{latched.description}</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-md px-2.5 py-1 text-label text-muted-foreground transition-colors hover:text-foreground">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="rounded-md bg-destructive px-3 py-1 text-label font-medium text-destructive-foreground shadow-elevation-5 transition hover:brightness-110"
					>
						{latched.actionLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

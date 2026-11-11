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

/**
 * Confirmation gate for destructive actions. It is open while there is a
 * target, and confirming hands that target back, so the caller never has to
 * guard against confirming nothing.
 */
export function ConfirmDeleteDialog<T>({
	target,
	onClose,
	title,
	description,
	actionLabel,
	onConfirm,
}: {
	target: T | undefined;
	onClose: () => void;
	title: (target: T) => string;
	description: string;
	actionLabel: string;
	onConfirm: (target: T) => void;
}) {
	// Radix keeps the dialog mounted through its exit animation; keep the last
	// target so the content doesn't flash empty after the caller clears it.
	const [latched, setLatched] = useState(target);
	if (target !== undefined && target !== latched) setLatched(target);

	return (
		<AlertDialog
			open={target !== undefined}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			{latched !== undefined && (
				<AlertDialogContent>
					<AlertDialogTitle>{title(latched)}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => onConfirm(latched)}
						>
							{actionLabel}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			)}
		</AlertDialog>
	);
}

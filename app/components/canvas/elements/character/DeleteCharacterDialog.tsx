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

export function DeleteCharacterDialog({
	name,
	onOpenChange,
	onDelete,
}: {
	name?: string;
	onOpenChange: (open: boolean) => void;
	onDelete: () => void;
}) {
	return (
		<AlertDialog open={name !== undefined} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogTitle>Delete {name}?</AlertDialogTitle>
				<AlertDialogDescription>
					This permanently removes the character and its avatar. It can&apos;t
					be undone.
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel className="rounded-md px-2.5 py-1 text-label text-muted-foreground transition-colors hover:text-foreground">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onDelete}
						className="rounded-md bg-destructive px-3 py-1 text-label font-medium text-destructive-foreground shadow-elevation-5 transition hover:brightness-110"
					>
						Delete character
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

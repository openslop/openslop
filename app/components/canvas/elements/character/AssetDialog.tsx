import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

/** The frame every asset dialog shares: what it edits, its editor, and the way out. */
export function AssetDialog({
	title,
	description,
	className = "max-w-2xl",
	actions,
	onClose,
	children,
}: {
	title: string;
	description: string;
	className?: string;
	/** Sits opposite Done in the footer. */
	actions?: ReactNode;
	onClose: () => void;
	children: ReactNode;
}) {
	return (
		<DialogContent className={className}>
			<DialogHeader className="shrink-0">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogBody>{children}</DialogBody>
			<DialogFooter className="shrink-0">
				{actions}
				<Button type="button" size="sm" onClick={onClose}>
					Done
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

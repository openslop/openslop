"use client";

import { Button } from "@/components/ui/button";
import {
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { useProject } from "@/lib/project/useProject";
import type { MetadataVoice } from "@/lib/project/types";
import { VoiceSection } from "./VoiceMetadataFields";

export function NarratorEditModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<MountedDialog open={open} onOpenChange={onOpenChange}>
			<NarratorEditDialogBody onClose={() => onOpenChange(false)} />
		</MountedDialog>
	);
}

function NarratorEditDialogBody({ onClose }: { onClose: () => void }) {
	const narration = useProject((s) => s.metadata.narration);
	const setNarration = useProject((s) => s.setNarration);

	const update = (partial: Partial<MetadataVoice>) =>
		setNarration({ ...narration, ...partial });

	return (
		<DialogContent className="max-w-2xl">
			<DialogHeader className="shrink-0">
				<DialogTitle>Narrator</DialogTitle>
				<DialogDescription>Change how the narrator sounds</DialogDescription>
			</DialogHeader>

			<DialogBody>
				<VoiceSection voice={narration} onChange={update} />
			</DialogBody>

			<DialogFooter className="shrink-0">
				<Button type="button" size="sm" onClick={onClose}>
					Done
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

"use client";

import {
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
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
			<NarratorEditDialogBody />
		</MountedDialog>
	);
}

function NarratorEditDialogBody() {
	const { projectId } = useConfig();
	const narration = useProjectStore(projectId, (s) => s.metadata.narration);
	const setNarration = useProjectStore(projectId, (s) => s.setNarration);

	const update = (partial: Partial<MetadataVoice>) =>
		setNarration({ ...narration, ...partial });

	return (
		<DialogContent className="max-w-2xl">
			<DialogHeader className="shrink-0">
				<DialogTitle>Narrator</DialogTitle>
				<DialogDescription>Change how the narrator sounds</DialogDescription>
			</DialogHeader>

			<div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
				<VoiceSection voice={narration} onChange={update} />
			</div>
		</DialogContent>
	);
}

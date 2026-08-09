"use client";

import { useState } from "react";
import dedent from "dedent";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { createDefaultConnector } from "@/lib/connectors/registry";
import { artStyleReferences } from "@/lib/project/artStyleReferences";
import { getProjectStore } from "@/lib/project/store";
import { useProject } from "@/lib/project/useProject";
import { TextAreaField } from "../character/fields";
import { ArtStylePresets } from "./ArtStylePresets";

const DERIVE_PROMPT = dedent`Vividly and concisely describe the visual art style of the attached reference image(s) in 1–2 concise sentences. Include ultra specific detail on character art style and overall art style.`;

export function ArtStyleModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<MountedDialog open={open} onOpenChange={onOpenChange}>
			<ArtStyleDialogBody onClose={() => onOpenChange(false)} />
		</MountedDialog>
	);
}

function ArtStyleDialogBody({ onClose }: { onClose: () => void }) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();
	const style = useProject((s) => s.metadata.style);
	const updateMetadata = useProject((s) => s.updateMetadata);

	const [deriving, setDeriving] = useState(false);

	const hasReferences = useQueueSelector(
		(q) =>
			artStyleReferences(getProjectStore(projectId).getState(), q).length > 0,
	);

	const deriveFromReferences = async () => {
		setDeriving(true);
		try {
			const connector = createDefaultConnector(connectorConfig, "llm", []);
			const { text } = await connector.generate({
				prompt: DERIVE_PROMPT,
				referenceImages: artStyleReferences(
					getProjectStore(projectId).getState(),
					queue,
				),
				maxTokens: 4096,
			});
			const derived = text.trim();
			if (derived) updateMetadata({ style: derived });
		} finally {
			setDeriving(false);
		}
	};

	return (
		<DialogContent className="max-w-3xl">
			<DialogHeader className="shrink-0">
				<DialogTitle>Art style</DialogTitle>
				<DialogDescription>
					This text is added to every image, including character avatars. For a
					closer match, also upload reference images in the style you want.
				</DialogDescription>
			</DialogHeader>

			<div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
				<div className="flex flex-col gap-2">
					<TextAreaField
						label="Description"
						value={style}
						onChange={(next) => updateMetadata({ style: next })}
						placeholder="Describe the look of every image, or paste a full image prompt"
						rows={5}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="self-start"
						disabled={!hasReferences || deriving}
						onClick={deriveFromReferences}
						tooltip={
							hasReferences
								? "From references: describe the reference images"
								: "From references: add reference images first"
						}
					>
						{deriving && <Spinner className="text-current" />}
						From references
					</Button>
				</div>

				<ArtStylePresets
					value={style}
					onSelect={(next) => updateMetadata({ style: next })}
				/>
			</div>

			<DialogFooter className="shrink-0">
				<Button type="button" size="sm" onClick={onClose}>
					Done
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

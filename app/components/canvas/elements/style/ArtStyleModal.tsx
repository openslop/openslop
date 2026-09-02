"use client";

import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { createConnector } from "@/lib/connectors/factory";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";
import {
	deriveArtStyle,
	uploadedAvatarUrls,
} from "@/lib/project/deriveArtStyle";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useProject } from "@/lib/project/useProject";
import { FIELD_CLS, FieldLabel } from "../character/fields";
import { ReferenceImages } from "../ReferenceImages";
import { ArtStylePresets } from "./ArtStylePresets";

const DESCRIPTION_ID = "art-style-description";

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
	const { connectorConfig } = useConfig();
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();
	const style = useProject((s) => s.metadata.style);
	const updateMetadata = useProject((s) => s.updateMetadata);
	const setStyle = (next: string) => updateMetadata({ style: next });

	const [deriving, setDeriving] = useState(false);
	const model = useDefaultModels().llm;

	const uploadedCount = useProject((s) => s.referenceImages.length);
	const avatarCount = useQueueSelector(
		(q) => uploadedAvatarUrls(store.getState(), q).length,
	);
	const hasReferences = uploadedCount + avatarCount > 0;

	const deriveFromReferences = async () => {
		setDeriving(true);
		try {
			const derived = await deriveArtStyle(
				createConnector("llm", model, connectorConfig.llm),
				store.getState(),
				queue,
			);
			if (derived) setStyle(derived);
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

			<DialogBody>
				<section aria-label="Reference images" className="flex flex-col gap-2">
					<FieldLabel>Reference images</FieldLabel>
					<div className="flex flex-wrap gap-2">
						<ReferenceImages />
					</div>
				</section>

				<div className="flex flex-col gap-2">
					<label htmlFor={DESCRIPTION_ID}>
						<FieldLabel>Art Style Description</FieldLabel>
					</label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="self-start"
						disabled={!hasReferences || deriving}
						onClick={deriveFromReferences}
						tooltip={
							hasReferences
								? undefined
								: "Use reference images and character avatars for art style description: upload some first"
						}
					>
						{deriving && <Spinner className="text-current" />}
						Use references
					</Button>
					<textarea
						id={DESCRIPTION_ID}
						rows={5}
						value={style}
						onChange={(e) => setStyle(e.target.value)}
						placeholder="Describe the look of every image, or paste a full image prompt"
						className={`${FIELD_CLS} resize-none`}
					/>
				</div>

				<ArtStylePresets value={style} onSelect={setStyle} />
			</DialogBody>

			<DialogFooter className="shrink-0">
				<Button type="button" size="sm" onClick={onClose}>
					Done
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

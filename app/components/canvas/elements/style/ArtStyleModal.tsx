"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { createConnector } from "@/lib/connectors/factory";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";
import {
	artStyleReferences,
	deriveArtStyle,
} from "@/lib/project/deriveArtStyle";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { useAsset, useAssets } from "@/lib/canvas/useAssets";
import { setAsset } from "@/lib/canvas/assetOps";
import { AssetDialog } from "../character/AssetDialog";
import { FieldLabel, TextAreaField } from "../character/fields";
import { ReferenceImages } from "../ReferenceImages";
import { ArtStylePresets } from "./ArtStylePresets";

export function ArtStyleModal({ onClose }: { onClose: () => void }) {
	const queue = useGenerationQueue();
	const editor = useSlateStatic();
	const assets = useAssets();
	const element = useAsset("style");
	const style = element ? getElementBodyText(element) : "";
	const setStyle = (text: string) =>
		setAsset(editor, "style", undefined, { text });

	const [deriving, setDeriving] = useState(false);
	const model = useDefaultModels().llm;

	const hasReferences = useQueueSelector(
		(q) => artStyleReferences(assets, q).length > 0,
	);

	const deriveFromReferences = async () => {
		setDeriving(true);
		try {
			const derived = await deriveArtStyle(
				createConnector("llm", model),
				assets,
				queue,
			);
			if (derived) setStyle(derived);
		} finally {
			setDeriving(false);
		}
	};

	return (
		<AssetDialog
			title="Art style"
			description="This text is added to every image, including character avatars. For a closer match, also upload reference images in the style you want."
			className="max-w-3xl"
			onClose={onClose}
		>
			<section aria-label="Reference images" className="flex flex-col gap-2">
				<FieldLabel>Reference images</FieldLabel>
				<div className="flex flex-wrap gap-2">
					<ReferenceImages />
				</div>
			</section>

			<TextAreaField
				label="Art Style Description"
				aside={
					<Button
						type="button"
						variant="outline"
						size="sm"
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
				}
				rows={5}
				value={style}
				onChange={setStyle}
				placeholder="Describe the look of every image, or paste a full image prompt"
			/>

			<ArtStylePresets value={style} onSelect={setStyle} />
		</AssetDialog>
	);
}

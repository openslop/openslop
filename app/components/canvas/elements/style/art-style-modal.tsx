"use client";

import { useTransition } from "react";
import { useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { useCreateConnector } from "@/lib/connectors/use-create-connector";
import { useDefaultModels } from "@/lib/connectors/use-default-models";
import {
	artStyleReferences,
	deriveArtStyle,
	type CharacterAvatar,
} from "@/lib/project/derive-art-style";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { useAsset, useAssets } from "@/lib/canvas/use-assets";
import { setAsset } from "@/lib/canvas/asset-ops";
import { toastError } from "@/lib/toast-error";
import { EmptyState } from "@/components/ui/empty-state";
import { User } from "@/components/ui/icon";
import { AssetDialog } from "../character/asset-dialog";
import { FieldHeader, FieldLabel, TextAreaField } from "../character/fields";
import { AssetTile } from "../asset-tile";
import { TileRow } from "../attributes/tile-row";
import { ReferenceImages } from "./reference-images";
import { ArtStylePresets } from "./art-style-presets";

export function ArtStyleModal({ onClose }: { onClose: () => void }) {
	const queue = useGenerationQueue();
	const editor = useSlateStatic();
	const assets = useAssets();
	const element = useAsset("asset_style");
	const style = element ? getElementBodyText(element) : "";
	const setStyle = (text: string) =>
		setAsset(editor, "asset_style", undefined, { text });

	const [deriving, startDeriving] = useTransition();
	const model = useDefaultModels().llm;
	const createConnector = useCreateConnector();

	useQueueSelector((q) => q.getResultVersion());
	const { images, avatars } = artStyleReferences(assets, queue);
	const references = [...images, ...avatars.map(({ url }) => url)];
	const hasReferences = references.length > 0;

	const deriveFromReferences = () =>
		startDeriving(async () => {
			try {
				setStyle(
					await deriveArtStyle(createConnector("llm", model), references),
				);
			} catch (error) {
				toastError(error, "Deriving the art style failed");
			}
		});

	return (
		<AssetDialog
			title="Art style"
			description="This text is added to every image, including character avatars. For a closer match, also upload reference images in the style you want."
			className="max-w-3xl"
			onClose={onClose}
		>
			<ReferenceImages />

			<CharacterAvatars avatars={avatars} />

			<TextAreaField
				label="Art Style Description"
				autoFocus
				aside={
					<Button
						type="button"
						variant="outline"
						size="sm"
						unavailable={!hasReferences}
						disabled={deriving}
						onClick={deriveFromReferences}
						tooltip={
							hasReferences
								? undefined
								: "Upload reference images or character avatars to describe their art style"
						}
					>
						{deriving && <Spinner />}
						Use images and avatars
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

/** The uploaded character avatars the art style is read from, shown read-only. */
function CharacterAvatars({ avatars }: { avatars: CharacterAvatar[] }) {
	return (
		<section aria-label="Character avatars" className="flex flex-col gap-2">
			<FieldHeader>
				<FieldLabel>Character avatars</FieldLabel>
			</FieldHeader>
			{avatars.length === 0 ? (
				<EmptyState
					icon={User}
					title="No uploaded character avatars yet"
					description="Character avatars you upload show up here"
				/>
			) : (
				<TileRow>
					{avatars.map(({ name, url }) => (
						<AssetTile
							key={name}
							name={name}
							previewUrl={url}
							context="Character avatar"
							Icon={User}
						/>
					))}
				</TileRow>
			)}
		</section>
	);
}

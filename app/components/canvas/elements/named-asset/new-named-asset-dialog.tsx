"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
	ASSET_KIND_SPECS,
	ASSET_KINDS,
	type AssetKind,
} from "@/lib/canvas/assets";
import { useNamedAssetNames } from "@/lib/canvas/use-assets";
import { normalizeAssetName } from "@/lib/project/asset-name";
import { ASSET_KIND_ICONS } from "../asset-kinds";
import type { NewNamedAsset } from "../asset-edit-context";

const KIND_OPTIONS = ASSET_KINDS.map((kind) => ({
	value: kind,
	label: ASSET_KIND_SPECS[kind].label,
	Icon: ASSET_KIND_ICONS[kind],
}));

export function NewNamedAssetDialog({
	preset,
	onCreated,
}: {
	preset: NewNamedAsset;
	onCreated: (kind: AssetKind, name: string) => void;
}) {
	const names = useNamedAssetNames();
	const [kind, setKind] = useState(preset.kind ?? "character");
	const [name, setName] = useState(preset.name ?? "");

	const normalized = normalizeAssetName(name);
	const collision = names.includes(normalized);
	const canSubmit = !!normalized && !collision;
	const label = ASSET_KIND_SPECS[kind].label;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		onCreated(kind, normalized);
	};

	return (
		<DialogContent className="max-w-sm">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<DialogHeader>
					<DialogTitle>New asset</DialogTitle>
					<DialogDescription>
						Pick a kind and a name. You can fill in the details next.
					</DialogDescription>
				</DialogHeader>

				<SegmentedControl
					value={kind}
					options={KIND_OPTIONS}
					onChange={setKind}
					ariaLabel="Kind"
					width="fill"
				/>

				<Input
					size="sm"
					autoFocus
					autoComplete="off"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder={`${label} name`}
					aria-label={`${label} name`}
				/>

				{collision && (
					<span className="text-label-xs text-destructive" role="alert">
						“{normalized}” is already taken. Pick another name.
					</span>
				)}

				<DialogFooter>
					<Button
						type="submit"
						variant="secondary"
						size="sm"
						disabled={!canSubmit}
					>
						Create
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}

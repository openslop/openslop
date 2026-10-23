"use client";

import { useSyncExternalStore } from "react";
import {
	useFocused,
	useReadOnly,
	useSelected,
	useSlateSelector,
	type RenderElementProps,
} from "slate-react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Pencil } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CharacterRefElement } from "@/lib/canvas/types";
import { isCharacter } from "@/lib/canvas/assets";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./character-pill";
import { useAssetEditors } from "./character/asset-edit-provider";

const noSubscription = () => () => {};

const useIsMac = () =>
	useSyncExternalStore(
		noSubscription,
		() => /Mac OS X/.test(navigator.userAgent),
		() => false,
	);

function EditCharacterButton({ name }: { name: string }) {
	const { editAsset } = useAssetEditors();
	const hasAvatar = useHasAsset("asset_avatar", name);
	return (
		<button
			type="button"
			aria-label={`Edit ${name}`}
			onMouseDown={(e) => e.preventDefault()}
			onClick={(e) => {
				// Slate selects a void when a click inside it reaches the editor.
				e.stopPropagation();
				editAsset(hasAvatar ? "asset_avatar" : "asset_voice", name);
			}}
			className="focus-ring absolute inset-y-0 start-0 flex aspect-square cursor-pointer items-center justify-center bg-background/70 text-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 hover:bg-background/90 focus-visible:opacity-100 focus-visible:ring-inset"
		>
			<Pencil size={10} />
		</button>
	);
}

function KnownCharacter({ name }: { name: string }) {
	const readOnly = useReadOnly();
	return (
		<Badge variant="subtle" size="inline" className="group/chip relative">
			<CharacterAvatar name={name} size="xs" className="rounded-none" />
			<span className="min-w-0 self-baseline truncate">{name}</span>
			{!readOnly && <EditCharacterButton name={name} />}
		</Badge>
	);
}

function UnknownCharacter({ name }: { name: string }) {
	return (
		<SimpleTooltip label={`No character named ${name}`}>
			<Badge variant="caution" size="inline">
				<AlertTriangle aria-hidden="true" />
				<span className="sr-only">Unknown character: </span>
				<span className="min-w-0 self-baseline truncate">{name}</span>
			</Badge>
		</SimpleTooltip>
	);
}

export function CharacterRef({
	attributes,
	children,
	element,
}: Omit<RenderElementProps, "element"> & { element: CharacterRefElement }) {
	const known = useSlateSelector((editor) =>
		isCharacter(editor.children, element.name),
	);
	const selected = useSelected();
	const focused = useFocused();
	const isMac = useIsMac();
	const Chip = known ? KnownCharacter : UnknownCharacter;

	return (
		<span
			{...attributes}
			contentEditable={false}
			className={cn(
				"relative mx-0.5 inline-flex rounded",
				selected &&
					focused &&
					"after:pointer-events-none after:absolute after:inset-0 after:rounded after:ring-2 after:ring-ring after:ring-inset",
			)}
		>
			{/* IME composition needs the spacer first on macOS and last elsewhere: slate#3490, slate#5360. */}
			{isMac && children}
			<span contentEditable={false} className="inline-flex">
				<Chip name={element.name} />
			</span>
			{!isMac && children}
		</span>
	);
}

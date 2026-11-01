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
import { AlertTriangle, Pencil, Plus, type IconComponent } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CharacterRefElement } from "@/lib/canvas/types";
import { isCharacter } from "@/lib/canvas/assets";
import { useHasAsset } from "@/lib/canvas/use-assets";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./character-pill";
import { useAssetEditors } from "./asset-edit-context";

const noSubscription = () => () => {};

const useIsMac = () =>
	useSyncExternalStore(
		noSubscription,
		() => /Mac OS X/.test(navigator.userAgent),
		() => false,
	);

function CharacterActionButton({
	label,
	icon: Icon,
	onClick,
}: {
	label: string;
	icon: IconComponent;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onMouseDown={keepFocus}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className="focus-ring absolute inset-y-0 start-0 flex aspect-square cursor-pointer items-center justify-center bg-background/70 text-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 hover:bg-background/90 focus-visible:opacity-100 focus-visible:ring-inset"
		>
			<Icon size={10} />
		</button>
	);
}

function KnownCharacter({ name }: { name: string }) {
	const readOnly = useReadOnly();
	const { editAsset } = useAssetEditors();
	const hasAvatar = useHasAsset("asset_avatar", name);
	return (
		<Badge variant="subtle" size="inline" className="group/chip relative">
			<CharacterAvatar name={name} size="xs" className="rounded-none" />
			<span className="min-w-0 self-baseline truncate">{name}</span>
			{!readOnly && (
				<CharacterActionButton
					label={`Edit ${name}`}
					icon={Pencil}
					onClick={() =>
						editAsset(hasAvatar ? "asset_avatar" : "asset_voice", name)
					}
				/>
			)}
		</Badge>
	);
}

function UnknownCharacter({ name }: { name: string }) {
	const readOnly = useReadOnly();
	const { createCharacter } = useAssetEditors();
	return (
		<SimpleTooltip label={`No character named ${name}`}>
			<Badge variant="caution" size="inline" className="group/chip relative">
				<AlertTriangle aria-hidden="true" />
				<span className="sr-only">Unknown character: </span>
				<span className="min-w-0 self-baseline truncate">{name}</span>
				{!readOnly && (
					<CharacterActionButton
						label={`Create ${name}`}
						icon={Plus}
						onClick={() => createCharacter(name)}
					/>
				)}
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

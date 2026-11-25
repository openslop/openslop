"use client";

import { useSyncExternalStore } from "react";
import {
	useFocused,
	useReadOnly,
	useSelected,
	type RenderElementProps,
} from "slate-react";
import { Badge } from "@/components/ui/badge";
import {
	AlertTriangle,
	Pencil,
	Plus,
	type IconComponent,
} from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CharacterRefElement } from "@/lib/canvas/types";
import { useKindOf } from "@/lib/canvas/use-assets";
import { usePicture } from "../hooks/use-picture";
import { cn } from "@/lib/utils";
import { useAssetEditors } from "./asset-edit-context";
import { AssetAvatar } from "./asset-avatar";

const noSubscription = () => () => {};

const useIsMac = () =>
	useSyncExternalStore(
		noSubscription,
		() => /Mac OS X/.test(navigator.userAgent),
		() => false,
	);

function RefActionButton({
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
			className="focus-ring absolute inset-y-0 inset-s-0 flex aspect-square cursor-pointer items-center justify-center bg-background/70 text-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 hover:bg-background/90 focus-visible:opacity-100 focus-visible:ring-inset"
		>
			<Icon size={10} />
		</button>
	);
}

function EditAssetButton({ name }: { name: string }) {
	const { editAsset } = useAssetEditors();
	const { type = "asset_voice" } = usePicture(name);
	return (
		<RefActionButton
			label={`Edit ${name}`}
			icon={Pencil}
			onClick={() => editAsset(type, name)}
		/>
	);
}

function CreateAssetButton({ name }: { name: string }) {
	const { openCreateAsset } = useAssetEditors();
	return (
		<RefActionButton
			label={`Create ${name}`}
			icon={Plus}
			onClick={() => openCreateAsset({ name })}
		/>
	);
}

function KnownAsset({ name }: { name: string }) {
	const readOnly = useReadOnly();
	return (
		<Badge variant="subtle" size="inline" className="group/chip relative">
			<AssetAvatar name={name} size="xs" className="rounded-none" />
			<span className="min-w-0 self-baseline truncate">{name}</span>
			{!readOnly && <EditAssetButton name={name} />}
		</Badge>
	);
}

function UnknownAsset({ name }: { name: string }) {
	const readOnly = useReadOnly();
	return (
		<SimpleTooltip label={`Nothing named ${name}`}>
			<Badge variant="caution" size="inline" className="group/chip relative">
				<AlertTriangle />
				<span className="sr-only">Unknown asset: </span>
				<span className="min-w-0 self-baseline truncate">{name}</span>
				{!readOnly && <CreateAssetButton name={name} />}
			</Badge>
		</SimpleTooltip>
	);
}

export function CharacterRef({
	attributes,
	children,
	element,
}: Omit<RenderElementProps, "element"> & { element: CharacterRefElement }) {
	const known = useKindOf(element.name) !== undefined;
	const selected = useSelected();
	const focused = useFocused();
	const isMac = useIsMac();

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
				{known ? (
					<KnownAsset name={element.name} />
				) : (
					<UnknownAsset name={element.name} />
				)}
			</span>
			{!isMac && children}
		</span>
	);
}

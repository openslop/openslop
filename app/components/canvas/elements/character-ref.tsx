"use client";

import { useSyncExternalStore } from "react";
import {
	useFocused,
	useSelected,
	useSlateSelector,
	type RenderElementProps,
} from "slate-react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CharacterRefElement } from "@/lib/canvas/types";
import { isCharacter } from "@/lib/canvas/assets";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./character-pill";

const noSubscription = () => () => {};

const useIsMac = () =>
	useSyncExternalStore(
		noSubscription,
		() => /Mac OS X/.test(navigator.userAgent),
		() => false,
	);

function KnownCharacter({ name }: { name: string }) {
	return (
		<Badge variant="subtle" size="inline">
			<CharacterAvatar name={name} size="xs" className="rounded-none" />
			<span className="min-w-0 self-baseline truncate">{name}</span>
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

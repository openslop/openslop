"use client";

import type { ReactNode } from "react";
import { NamedAssetImage } from "./named-asset-image";

function CharacterName({ name }: { name: string }) {
	return (
		<span className="truncate text-label-xs font-medium text-foreground">
			{name}
		</span>
	);
}

export function CharacterPill({
	name,
	children,
}: {
	name?: string;
	children?: ReactNode;
}) {
	return (
		<div
			className={`relative inline-flex h-6 max-w-[140px] shrink-0 items-center rounded-md text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground ${
				name ? "gap-1.5 pl-1 pr-2" : "px-0.5"
			}`}
		>
			<NamedAssetImage name={name} className="rounded-md" />
			{name && <CharacterName name={name} />}
			{children}
		</div>
	);
}

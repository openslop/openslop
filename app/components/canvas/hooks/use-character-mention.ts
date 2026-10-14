"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Range } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import {
	insertCharacterRef,
	mentionAt,
	type Mention,
} from "@/lib/canvas/character-refs";
import { useAvatarNames } from "@/lib/canvas/use-assets";

const sameMention = (a: Mention | null | undefined, b: Mention | undefined) =>
	a && b ? a.query === b.query && Range.equals(a.range, b.range) : !a && !b;

const matching = (names: string[], query: string) =>
	names.filter((name) => name.toLowerCase().startsWith(query.toLowerCase()));

/** `useSlateSelector` keeps the same `Mention` object until `sameMention` sees a change, so it keys the state below. */
export function useCharacterMention() {
	const editor = useSlateStatic();
	const listboxId = useId();
	const names = useAvatarNames();
	const typed = useSlateSelector(mentionAt, sameMention);
	const [dismissed, setDismissed] = useState<Mention>();
	const [highlight, setHighlight] = useState<{ for?: Mention; index: number }>({
		index: 0,
	});

	const options = typed ? matching(names, typed.query) : [];
	const mention = typed !== dismissed && options.length > 0 ? typed : undefined;
	const active = highlight.for === mention ? highlight.index : 0;

	const select = (name: string) => {
		if (mention) insertCharacterRef(editor, mention, name);
	};

	const move = (step: number) =>
		setHighlight({
			for: mention,
			index: (active + step + options.length) % options.length,
		});

	const onKeyDown = (event: KeyboardEvent) => {
		const name = options[active];
		if (!mention || !name) return;
		const keys: Record<string, () => void> = {
			ArrowDown: () => move(1),
			ArrowUp: () => move(-1),
			Enter: () => select(name),
			Tab: () => select(name),
		};
		const handle = keys[event.key];
		if (!handle) return;
		event.preventDefault();
		handle();
	};

	return {
		mention,
		options,
		active,
		listboxId,
		select,
		dismiss: () => setDismissed(mention),
		onKeyDown,
	};
}

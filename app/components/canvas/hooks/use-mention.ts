"use client";

import isEqual from "lodash/isEqual";
import { useId, useState, type KeyboardEvent } from "react";
import { Range, type Editor } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { imageAssetNamesByKind } from "@/lib/canvas/assets";
import {
	insertNameRef,
	mentionAt,
	mentionGroups,
	type Mention,
} from "@/lib/canvas/name-refs";

const sameMention = (a: Mention | null | undefined, b: Mention | undefined) =>
	a && b ? a.query === b.query && Range.equals(a.range, b.range) : !a && !b;

const selectNames = (editor: Editor) => imageAssetNamesByKind(editor.children);

/** `useSlateSelector` keeps the same `Mention` object until `sameMention` sees a change, so it keys the state below. */
export function useMention() {
	const editor = useSlateStatic();
	const listboxId = useId();
	const names = useSlateSelector(selectNames, isEqual);
	const typed = useSlateSelector(mentionAt, sameMention);
	const [dismissed, setDismissed] = useState<Mention>();
	const [highlight, setHighlight] = useState<{ for?: Mention; index: number }>({
		index: 0,
	});

	const groups = typed ? mentionGroups(names, typed.query) : [];
	const options = groups.flatMap((group) => group.names);
	const mention = typed !== dismissed && options.length > 0 ? typed : undefined;
	const active = highlight.for === mention ? highlight.index : 0;

	const select = (name: string) => {
		if (mention) insertNameRef(editor, mention, name);
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
		groups,
		active,
		listboxId,
		select,
		dismiss: () => setDismissed(mention),
		onKeyDown,
	};
}

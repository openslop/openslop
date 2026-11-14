/** Radix reports a plain string, and "" when the active item is pressed again, so only a listed option reaches `onChange`. */
export const onOptionChange =
	<T extends string>(
		options: readonly { value: T }[],
		onChange: (value: T) => void,
	) =>
	(next: string) => {
		const picked = options.find((option) => option.value === next);
		if (picked) onChange(picked.value);
	};

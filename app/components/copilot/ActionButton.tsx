import type { ReactNode } from "react";

export function ActionButton({
	label,
	icon,
	onClick,
	disabled,
}: {
	label: string;
	icon: ReactNode;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className="relative grain ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1f1528]/60 text-violet-300 transition-[filter] hover:brightness-[1.3] disabled:opacity-30 disabled:pointer-events-none"
		>
			{icon}
		</button>
	);
}

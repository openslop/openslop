import type { ReactNode } from "react";

export function CopilotShell({ children }: { children: ReactNode }) {
	return (
		<div className="w-full rounded-xl border border-accent-violet/30 bg-glass-fill backdrop-blur-xl transition-shadow focus-within:shadow-glow">
			{children}
		</div>
	);
}

export function splitPlaceholder(placeholder?: ReactNode): {
	text?: string;
	overlay?: ReactNode;
} {
	return typeof placeholder === "string"
		? { text: placeholder }
		: { overlay: placeholder };
}

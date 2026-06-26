import Link from "next/link";

export function AuthFooterLink({
	prompt,
	href,
	label,
}: {
	prompt: string;
	href: string;
	label: string;
}) {
	return (
		<>
			{prompt}{" "}
			<Link
				href={href}
				className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
			>
				{label}
			</Link>
		</>
	);
}

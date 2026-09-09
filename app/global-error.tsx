"use client";

import { useEffect } from "react";
import { errorMessage } from "@/lib/errors";

/**
 * Root-level recovery for errors thrown by the root layout itself. Replaces
 * the root layout while active, so it owns `<html>`/`<body>` and inlines its
 * styles (global styles and theme tokens are not available here). Offers
 * `retry()` (re-fetch + re-render) and a full reload as the last-resort
 * recovery — the only recovery previously available to users was a manual
 * page reload.
 */
export default function GlobalError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const buttonStyle: React.CSSProperties = {
		display: "inline-flex",
		height: "2.25rem",
		alignItems: "center",
		justifyContent: "center",
		padding: "0 1rem",
		border: "1px solid #e5e5e5",
		borderRadius: "0.375rem",
		background: "transparent",
		color: "#171717",
		font: "inherit",
		cursor: "pointer",
	};
	const primaryButtonStyle: React.CSSProperties = {
		...buttonStyle,
		border: "none",
		background: "#171717",
		color: "#fdfcfc",
	};

	return (
		<html lang="en">
			<body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
				<main
					role="alert"
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: "1rem",
						minHeight: "100vh",
						maxWidth: "32rem",
						margin: "0 auto",
						padding: "0 1.5rem",
						textAlign: "center",
					}}
				>
					<h1 style={{ fontSize: "1.25rem", margin: 0 }}>
						OpenSlop hit a snag
					</h1>
					<p style={{ margin: 0, color: "#737373" }}>{errorMessage(error)}</p>
					<div style={{ display: "flex", gap: "0.5rem" }}>
						<button type="button" onClick={retry} style={primaryButtonStyle}>
							Try again
						</button>
						<button
							type="button"
							onClick={() => window.location.reload()}
							style={buttonStyle}
						>
							Reload page
						</button>
					</div>
				</main>
			</body>
		</html>
	);
}

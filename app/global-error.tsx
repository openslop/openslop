"use client";

import ErrorPage from "./error";
import "./globals.css";

/** Replaces the root layout while active, so it must own `<html>` and `<body>`. */
export default function GlobalError(props: {
	error: Error;
	retry: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<ErrorPage {...props} />
			</body>
		</html>
	);
}

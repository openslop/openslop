"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/clients/http";
import { errorMessage } from "@/lib/errors";
import {
	type CodeEntry,
	emptyAccessCode,
	eraseBefore,
	isComplete,
	pasteCode,
	typeChar,
} from "@/lib/auth/accessCode";

export default function AccessCodeInput() {
	const router = useRouter();
	const [values, setValues] = useState<string[]>(emptyAccessCode);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const resetWithError = useCallback((message: string) => {
		setError(message);
		setValues(emptyAccessCode());
		inputRefs.current[0]?.focus();
	}, []);

	const submitCode = useCallback(
		async (code: string) => {
			setLoading(true);
			setError("");
			try {
				const { redirect } = await apiJson<{ redirect: string }>(
					"/api/validate-code",
					{ method: "POST", body: { code } },
				);
				router.push(redirect);
			} catch (err) {
				console.error("Access code validation failed", err);
				resetWithError(errorMessage(err));
			} finally {
				setLoading(false);
			}
		},
		[router, resetWithError],
	);

	const apply = (entry: CodeEntry | null) => {
		if (!entry) return;
		setValues(entry.values);
		if (entry.focusIndex !== null) {
			inputRefs.current[entry.focusIndex]?.focus();
		}
		if (isComplete(entry.values)) submitCode(entry.values.join(""));
	};

	const handleChange = (index: number, value: string) => {
		const entry = typeChar(values, index, value);
		if (!entry) return;
		setError("");
		apply(entry);
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key !== "Backspace") return;
		apply(eraseBefore(values, index));
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const entry = pasteCode(e.clipboardData.getData("text"));
		if (!entry) return;
		setError("");
		apply(entry);
	};

	return (
		<div>
			<div className="flex gap-2 justify-center">
				{values.map((val, i) => (
					<input
						key={i}
						ref={(el) => {
							inputRefs.current[i] = el;
						}}
						type="text"
						inputMode="text"
						maxLength={1}
						value={val}
						onChange={(e) => handleChange(i, e.target.value)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={i === 0 ? handlePaste : undefined}
						disabled={loading}
						aria-label={`Code character ${i + 1}`}
						spellCheck={false}
						autoComplete="off"
						className="h-11 w-9 rounded-md border border-border bg-input text-center text-body-lg font-semibold text-foreground outline-none transition-[border-color,box-shadow,opacity] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 sm:h-13 sm:w-11 sm:rounded-lg sm:text-heading-sm"
						autoFocus={i === 0}
					/>
				))}
			</div>
			{error && (
				<p
					aria-live="polite"
					className="mt-3 text-center text-body text-destructive"
				>
					{error}
				</p>
			)}
			{loading && (
				<p
					aria-live="polite"
					className="mt-3 text-center text-body text-muted-foreground"
				>
					Validating&hellip;
				</p>
			)}
		</div>
	);
}

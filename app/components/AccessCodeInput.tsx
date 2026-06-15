"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const CODE_LENGTH = 6;
const EMPTY_CODE = () => Array<string>(CODE_LENGTH).fill("");

export default function AccessCodeInput() {
	const router = useRouter();
	const [values, setValues] = useState<string[]>(EMPTY_CODE);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const submitCode = useCallback(
		async (code: string) => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch("/api/validate-code", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code }),
				});
				const data = await res.json();
				if (res.ok && data.redirect) {
					router.push(data.redirect);
				} else {
					setError(data.error || "Invalid access code");
					setValues(EMPTY_CODE());
					inputRefs.current[0]?.focus();
				}
			} catch {
				setError("Something went wrong. Please try again.");
				setValues(EMPTY_CODE());
				inputRefs.current[0]?.focus();
			} finally {
				setLoading(false);
			}
		},
		[router],
	);

	const handleChange = (index: number, value: string) => {
		const char = value.slice(-1).toUpperCase();
		if (char && !/^[A-Z0-9]$/.test(char)) return;

		const next = [...values];
		next[index] = char;
		setValues(next);
		setError("");

		if (char && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}

		if (char && next.every((v) => v !== "")) {
			submitCode(next.join(""));
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && !values[index] && index > 0) {
			const next = [...values];
			next[index - 1] = "";
			setValues(next);
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData
			.getData("text")
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, "")
			.slice(0, CODE_LENGTH);

		if (!pasted) return;

		const next = EMPTY_CODE();
		for (let i = 0; i < pasted.length; i++) {
			next[i] = pasted[i];
		}
		setValues(next);
		setError("");

		if (pasted.length === CODE_LENGTH) {
			submitCode(next.join(""));
		} else {
			inputRefs.current[pasted.length]?.focus();
		}
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
						className="h-11 w-9 rounded-md border border-border bg-input text-center text-base font-semibold text-foreground outline-none transition-[border-color,box-shadow,opacity] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 sm:h-13 sm:w-11 sm:rounded-lg sm:text-lg"
						autoFocus={i === 0}
					/>
				))}
			</div>
			{error && (
				<p
					aria-live="polite"
					className="mt-3 text-center text-sm text-destructive"
				>
					{error}
				</p>
			)}
			{loading && (
				<p
					aria-live="polite"
					className="mt-3 text-center text-sm text-muted-foreground"
				>
					Validating&hellip;
				</p>
			)}
		</div>
	);
}

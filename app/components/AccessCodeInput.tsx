"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/clients/http";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import {
	ACCESS_CODE_LENGTH,
	type CodeEntry,
	emptyAccessCode,
	eraseBefore,
	isComplete,
	pasteCode,
	typeChar,
} from "@/lib/auth/accessCode";

const INCOMPLETE_CODE = `Enter all ${ACCESS_CODE_LENGTH} characters of your access code`;

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
			} catch (cause) {
				console.error("Access code validation failed", cause);
				resetWithError(errorMessage(cause));
			} finally {
				setLoading(false);
			}
		},
		[router, resetWithError],
	);

	const applyEntry = (entry: CodeEntry | null) => {
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
		applyEntry(entry);
	};

	const handleKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key !== "Backspace") return;
		applyEntry(eraseBefore(values, index));
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		event.preventDefault();
		const entry = pasteCode(event.clipboardData.getData("text"));
		if (!entry) return;
		setError("");
		applyEntry(entry);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!isComplete(values)) {
			setError(INCOMPLETE_CODE);
			return;
		}
		submitCode(values.join(""));
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex w-full flex-col gap-4 sm:gap-6"
		>
			<div>
				<div className="flex gap-2 justify-center">
					{values.map((value, index) => (
						<input
							key={index}
							ref={(element) => {
								inputRefs.current[index] = element;
							}}
							type="text"
							inputMode="text"
							maxLength={1}
							value={value}
							onChange={(event) => handleChange(index, event.target.value)}
							onKeyDown={(event) => handleKeyDown(index, event)}
							onPaste={index === 0 ? handlePaste : undefined}
							disabled={loading}
							aria-label={`Code character ${index + 1}`}
							spellCheck={false}
							autoComplete="off"
							className="h-11 w-9 rounded-md border border-border bg-input text-center text-body-lg font-semibold text-foreground outline-none transition-[border-color,box-shadow,opacity] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 sm:h-13 sm:w-11 sm:rounded-lg sm:text-heading-sm"
							autoFocus={index === 0}
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
			<Button
				type="submit"
				variant="accent"
				size="cta"
				disabled={loading}
				className="mt-2 w-full"
			>
				Get Started
			</Button>
		</form>
	);
}

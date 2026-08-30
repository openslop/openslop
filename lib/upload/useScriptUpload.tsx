"use client";

import { useRef, useState } from "react";
import { toastError } from "@/lib/toastError";
import { extractScriptText } from "@/lib/upload/scriptPdf";

/**
 * Picks a script PDF and hands its extracted text to `onExtract`. The file
 * never reaches the caller: a script enters the app as text, the same as one
 * that was typed or pasted.
 */
export function useScriptUpload({
	onExtract,
}: {
	onExtract: (text: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [extracting, setExtracting] = useState(false);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		setExtracting(true);
		try {
			onExtract(await extractScriptText(file));
		} catch (error) {
			toastError(error, "Could not read that PDF");
		} finally {
			setExtracting(false);
		}
	};

	return {
		openPicker: () => inputRef.current?.click(),
		extracting,
		inputElement: (
			<input
				ref={inputRef}
				type="file"
				accept="application/pdf"
				className="hidden"
				onChange={handleFileChange}
			/>
		),
	};
}

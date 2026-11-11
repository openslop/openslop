"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toastError } from "@/lib/toast-error";
import { uploadFile } from "./upload-file";
import {
	acceptedTypes,
	partitionFiles,
	type Upload,
	type UploadKind,
} from "./upload-files";

const carriesFiles = (data: DataTransfer) => data.types.includes("Files");

/**
 * Without this, a file dropped anywhere but a drop zone makes the browser
 * navigate away from the app to open it.
 */
function useBlockStrayFileDrops() {
	useEffect(() => {
		const block = (e: DragEvent) => {
			if (e.dataTransfer && carriesFiles(e.dataTransfer)) e.preventDefault();
		};
		window.addEventListener("dragover", block);
		window.addEventListener("drop", block);
		return () => {
			window.removeEventListener("dragover", block);
			window.removeEventListener("drop", block);
		};
	}, []);
}

export function useFileUpload({
	kinds,
	onUpload,
	multiple = false,
}: {
	kinds: readonly UploadKind[];
	onUpload: (uploads: Upload[]) => void | Promise<void>;
	multiple?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploadingCount, setUploadingCount] = useState(0);
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	useBlockStrayFileDrops();

	const upload = async (candidates: File[]) => {
		const { accepted, rejected } = partitionFiles(candidates, kinds);
		for (const { name, reason } of rejected)
			toastError(`${name} ${reason}`, "Not uploaded");

		const files = multiple ? accepted : accepted.slice(0, 1);
		if (files.length === 0) return;

		setUploadingCount((count) => count + files.length);
		try {
			const results = await Promise.allSettled(
				files.map(async ({ file, kind }) => ({
					kind,
					name: file.name,
					url: await uploadFile(kind, file),
				})),
			);
			const uploads: Upload[] = [];
			for (const result of results) {
				if (result.status === "fulfilled") uploads.push(result.value);
				else toastError(result.reason);
			}
			// Store and state updates render in separate passes; one commit keeps placeholders from showing beside what replaced them.
			await flushSync(() => {
				setUploadingCount((count) => count - files.length);
				return uploads.length > 0 ? onUpload(uploads) : undefined;
			});
		} catch (error) {
			toastError(error);
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		try {
			await upload(files);
		} finally {
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const inputElement = (
		<input
			ref={inputRef}
			type="file"
			accept={acceptedTypes(kinds)}
			multiple={multiple}
			className="hidden"
			onChange={handleFileChange}
		/>
	);

	const dropZoneProps = {
		onDragOver: (e: React.DragEvent) => {
			if (!carriesFiles(e.dataTransfer)) return;
			e.preventDefault();
			e.dataTransfer.dropEffect = "copy";
			setIsDraggingOver(true);
		},
		onDragLeave: (e: React.DragEvent) => {
			if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
			setIsDraggingOver(false);
		},
		onDrop: (e: React.DragEvent) => {
			if (!carriesFiles(e.dataTransfer)) return;
			e.preventDefault();
			setIsDraggingOver(false);
			void upload(Array.from(e.dataTransfer.files));
		},
		onPaste: (e: React.ClipboardEvent) => {
			const files = Array.from(e.clipboardData.files);
			if (files.length === 0) return;
			e.preventDefault();
			void upload(files);
		},
	};

	return {
		openPicker: () => inputRef.current?.click(),
		uploading: uploadingCount > 0,
		uploadingCount,
		inputElement,
		dropZoneProps,
		isDraggingOver,
	};
}

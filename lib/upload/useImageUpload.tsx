"use client";

import { useEffect, useRef, useState } from "react";
import { toastError } from "@/lib/toastError";
import { partitionImageFiles } from "@/lib/upload/imageFiles";
import { uploadImage } from "@/lib/upload/uploadImage";

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

export function useImageUpload({
	onUpload,
	multiple = false,
}: {
	onUpload: (urls: string[]) => void;
	multiple?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploadingCount, setUploadingCount] = useState(0);
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	useBlockStrayFileDrops();

	const upload = async (candidates: File[]) => {
		const { accepted, rejected } = partitionImageFiles(candidates);
		for (const { name, reason } of rejected)
			toastError(`${name} ${reason}`, "Not uploaded");

		const files = multiple ? accepted : accepted.slice(0, 1);
		if (files.length === 0) return;

		setUploadingCount((n) => n + files.length);
		try {
			const results = await Promise.allSettled(files.map(uploadImage));
			const urls: string[] = [];
			for (const r of results) {
				if (r.status === "fulfilled") urls.push(r.value);
				else toastError(r.reason);
			}
			if (urls.length > 0) onUpload(urls);
		} finally {
			setUploadingCount((n) => n - files.length);
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
			accept="image/*"
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

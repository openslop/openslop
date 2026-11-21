import { toastError } from "@/lib/toast-error";

/** A play cut short by a pause is normal use, not a failure worth surfacing. */
export function startPlayback(audio: HTMLAudioElement): void {
	audio.play().catch((error: unknown) => {
		if (error instanceof DOMException && error.name === "AbortError") return;
		toastError(error, "Could not play audio");
	});
}

/** A source that fails mid-play leaves the element unpaused. */
export function stopFailedPlayback(audio: HTMLAudioElement): void {
	if (audio.paused) return;
	audio.pause();
	toastError(
		audio.error?.message || "the file stopped loading",
		"Could not play audio",
	);
}

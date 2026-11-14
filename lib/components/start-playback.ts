import { toastError } from "@/lib/toast-error";

/** A play cut short by a pause is normal use, not a failure worth surfacing. */
export function startPlayback(audio: HTMLAudioElement): void {
	audio.play().catch((error: unknown) => {
		if (error instanceof DOMException && error.name === "AbortError") return;
		toastError(error, "Could not play audio");
	});
}

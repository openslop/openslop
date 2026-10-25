import type { Caption } from "@remotion/captions";
import { secondsCaption } from "@/lib/providers/timestamps-file";

export const caption = (
	text: string,
	startSec: number,
	endSec: number,
): Caption => secondsCaption(` ${text}`, startSec, endSec);

import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { none } from "@remotion/transitions/none";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import type { Dimensions } from "./aspectRatio";
import type { TransitionType } from "./transitions";

// Each presentation has its own prop type — TransitionPresentation is invariant
// in its generic, so we widen with `any` at the boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Presentation = TransitionPresentation<any>;

const PRESENTATIONS: Record<
	TransitionType,
	(dims: Dimensions) => Presentation
> = {
	none: () => none(),
	fade: () => fade(),
	slide: () => slide(),
	wipe: () => wipe(),
	flip: () => flip(),
	clockWipe: ({ width, height }) => clockWipe({ width, height }),
	iris: ({ width, height }) => iris({ width, height }),
};

export function getPresentation(
	name: TransitionType,
	dims: Dimensions,
): Presentation {
	return PRESENTATIONS[name](dims);
}

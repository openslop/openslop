import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Self-contained icon library backed by the masked-SVG token set in
 * `icons.css`. Each icon is a CSS variable (`--<name>-icon`) holding a
 * `currentColor` data-URI; the `.icon` base class paints it with the current
 * text color via `mask-image`, so icons inherit color and size (`1em`) like
 * text. Add a new icon by dropping its `--<name>-icon` variable into
 * `icons.css` and an `icon("<name>")` export below.
 */
export interface IconProps extends ComponentPropsWithoutRef<"span"> {
	/** Pixel size (number) or any CSS length. Defaults to 16. */
	size?: number | string;
}

export type IconComponent = (props: IconProps) => React.ReactElement;

function icon(name: string): IconComponent {
	const Component = ({ size = 16, className, style, ...props }: IconProps) => (
		<span
			aria-hidden="true"
			className={cn("icon", className)}
			style={
				{
					fontSize: typeof size === "number" ? `${size}px` : size,
					...style,
					"--icon-mask": `var(--${name}-icon)`,
				} as CSSProperties
			}
			{...props}
		/>
	);
	Component.displayName = `Icon(${name})`;
	return Component;
}

export const AlertCircle = icon("alert");
export const AlignBottom = icon("arrow-line-down");
export const AlignCenter = icon("arrows-inwards");
export const AlignLeft = icon("arrow-line-left");
export const AlignMiddle = icon("arrows-in-line-vertical");
export const AlignRight = icon("arrow-line-right");
export const AlignTop = icon("arrow-line-up");
export const ArrowLeft = icon("arrow-left");
export const Bold = icon("bold");
export const BookOpen = icon("book-open");
export const Film = icon("film");
export const Music = icon("music");
export const Proportions = icon("aspect-ratio");
export const Check = icon("check");
export const ChevronDown = icon("chevron-down");
export const ChevronRight = icon("chevron-right");
export const ChevronUp = icon("chevron-up");
export const ChevronsDownUp = icon("collapse");
export const ChevronsLeft = icon("chevrons-left");
export const ChevronsRight = icon("chevrons-right");
export const ChevronsUpDown = icon("expand");
export const Circle = icon("circle");
export const Codesandbox = icon("codesandbox");
export const Contrast = icon("contrast");
export const Copy = icon("copy");
export const CornerDownLeft = icon("corner-down-left");
export const Crosshair = icon("crosshair");
export const Download = icon("download");
export const Eye = icon("eye");
export const EyeOff = icon("eye-off");
export const GripVertical = icon("grabber");
export const Home = icon("home");
export const Hourglass = icon("hour-glass");
export const Image = icon("image");
export const ImagePlus = icon("add-image");
export const Italic = icon("italic");
export const Layout = icon("layout");
export const Loader2 = icon("spinner");
export const LogOut = icon("log-out");
export const MagicVideo = icon("magic-video");
export const Maximize = icon("maximize");
export const Mic = icon("mic");
export const Motion = icon("motion");
export const Palette = icon("theme-swatches");
export const PanelLeft = icon("sidebar-left");
export const PanelRight = icon("sidebar-right");
export const PanelTop = icon("layout-alt-3");
export const Pause = icon("pause");
export const Pencil = icon("pencil");
export const Play = icon("play");
export const Plus = icon("plus");
export const Search = icon("search");
export const SlidersHorizontal = icon("sliders");
export const SlidersAlt = icon("sliders-alt");
export const SlidersAltFill = icon("sliders-alt-fill");
export const Sparkles = icon("magic");
export const SquareFilled = icon("square-filled");
export const Thickness = icon("thickness");
export const TextSize = icon("text-size");
export const TextBox = icon("text-box");
export const TextBoxFill = icon("text-box-fill");
export const Trash2 = icon("trash");
export const Underline = icon("underline");
export const User = icon("user");
export const UserPlus = icon("user-plus");
export const Video = icon("video");
export const Voice = icon("voice");
export const Volume2 = icon("volume-2");
export const VolumeX = icon("volume-x");
export const Wand2 = icon("magic-wand");
export const Waveform = icon("wave-sine");
export const X = icon("x");

import type { ImageGenerateParams } from "@/lib/connectors/types";
import type { BundleFile } from "@/lib/api/asset-bundle";
import {
	DEFAULT_IMAGE_FORMAT,
	IMAGE_MIME_TYPES,
	type ImageFormat,
} from "@/lib/connectors/image/enums";
import { BaseProvider, type RawResult } from "../base";
import { characterAvatars } from "@/lib/connectors/characters";
import { reportedCost, validateRunwareKey, withRunware } from "../runware";
import type { VendorParams } from "@/lib/connectors/models";
import type { ImageProvider } from "../types";

type RawImageResult = { data: string; format: ImageFormat } & RawResult;

const RUNWARE_FORMATS = { jpg: "JPG", png: "PNG", webp: "WEBP" } as const;

const DEFAULT_SIZE = { width: 2848, height: 1600 };

export class RunwareImage
	extends BaseProvider<VendorParams<ImageGenerateParams>, RawImageResult>
	implements ImageProvider
{
	protected readonly blobConfig = { type: "image", provider: "runware" };
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
	}

	async validate() {
		return validateRunwareKey(this.apiKey);
	}

	protected toFiles(result: RawImageResult): BundleFile[] {
		return [
			{
				key: "image",
				filename: `output.${result.format}`,
				data: Buffer.from(result.data, "base64"),
				contentType: IMAGE_MIME_TYPES[result.format],
			},
		];
	}

	protected async _generate(params: VendorParams<ImageGenerateParams>) {
		const format = params.format ?? DEFAULT_IMAGE_FORMAT;
		const referenceImages = [
			...characterAvatars(params.characterAssets ?? []),
			...(params.referenceImages ?? []),
		];
		return withRunware(this.apiKey, async (runware) => {
			const results = await runware.imageInference({
				positivePrompt: params.prompt,
				model: params.model,
				width: params.width ?? DEFAULT_SIZE.width,
				height: params.height ?? DEFAULT_SIZE.height,
				outputType: "base64Data",
				outputFormat: RUNWARE_FORMATS[format],
				numberResults: 1,
				includeCost: true,
				...(referenceImages.length > 0 && { referenceImages }),
			});

			const image = results?.[0];
			if (!image?.imageBase64Data) throw new Error("No image data returned");

			return {
				data: image.imageBase64Data,
				format,
				costUsd: reportedCost(image),
			};
		});
	}
}

export type MetadataVoice = {
	gender?: string;
	age?: string;
	pitch?: string;
	accent?: string;
	texture?: string;
};

export type MetadataCharacter = MetadataVoice & {
	description: string;
	avatarUrl?: string;
};

export type Metadata = {
	style: string;
	narration: MetadataVoice;
	characters: Record<string, MetadataCharacter>;
};

export type DeepPartial<T> = T extends object
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: T;

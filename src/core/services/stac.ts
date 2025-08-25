export interface STACItem {
	id: string;
	type: 'Feature';
	geometry: {
		type: string;
		coordinates: number[][][];
	};
	bbox: number[];
	properties: {
		datetime: string;
		title?: string;
		description?: string;
		platform?: string;
		instruments?: string[];
		gsd?: number;
		'eo:cloud_cover'?: number;
		[key: string]: any;
	};
	assets: {
		[key: string]: {
			href: string;
			type: string;
			title?: string;
			description?: string;
			roles?: string[];
		};
	};
	links: Array<{
		rel: string;
		href: string;
		type?: string;
		title?: string;
	}>;
}

export interface STACSearchResponse {
	type: 'FeatureCollection';
	features: STACItem[];
	links: Array<{
		rel: string;
		href: string;
		type?: string;
		title?: string;
	}>;
	context?: {
		returned: number;
		limit: number;
		matched: number;
	};
}

export interface STACSearchParams {
	bbox?: number[];
	time?: string;
	collections?: string[];
	limit?: number;
	datetime?: string;
	[key: string]: any;
}

export class STACService {
	private readonly baseUrl = 'https://planetarycomputer.microsoft.com/api/stac/v1';
	private readonly defaultCollections = ['sentinel-2-l2a'];

	async searchItems(params: STACSearchParams): Promise<STACSearchResponse> {
		const searchBody = {
			...params,
			collections: this.defaultCollections,
			limit: params.limit || 20
		};

		try {
			console.log('Searching STAC with params:', searchBody);

			const response = await fetch(`${this.baseUrl}/search`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/geo+json'
				},
				body: JSON.stringify(searchBody)
			});

			if (!response.ok) {
				throw new Error(`Search failed: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			if (!data.features || !Array.isArray(data.features)) {
				throw new Error('Invalid response format: missing features array');
			}

			console.log('STAC search results:', data.features.length, 'items found');
			if (data.features.length > 0) {
				console.log('First item assets:', Object.keys(data.features[0].assets));
				console.log('First item asset details:', data.features[0].assets);
			}

			return data;
		} catch (error) {
			console.error('STAC search error:', error);

			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new Error('Network error: Please check your internet connection');
			}

			if (error instanceof Error) {
				throw new Error(`Search failed: ${error.message}`);
			}

			throw new Error('An unexpected error occurred during search');
		}
	}

	getAssetUrl(item: STACItem, assetType: string = 'visual'): string | null {
		try {
			const asset = item.assets[assetType];
			if (!asset) {
				console.log(`Asset type '${assetType}' not found. Available assets:`, Object.keys(item.assets));
				const firstAsset = Object.values(item.assets)[0];
				return firstAsset?.href || null;
			}
			return asset.href;
		} catch (error) {
			console.error('Error getting asset URL:', error);
			return null;
		}
	}

	getThumbnailUrl(item: STACItem): string | null {
		try {
			return this.getAssetUrl(item, 'thumbnail') ||
				this.getAssetUrl(item, 'overview') ||
				this.getAssetUrl(item, 'visual');
		} catch (error) {
			console.error('Error getting thumbnail URL:', error);
			return null;
		}
	}

	formatDatetime(datetime: string): string {
		try {
			return new Date(datetime).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch (error) {
			console.error('Error formatting datetime:', error);
			return 'Unknown date';
		}
	}

	getCloudCover(item: STACItem): number | null {
		try {
			return item.properties.eo?.cloud_cover ||
				item.properties['eo:cloud_cover'] ||
				null;
		} catch (error) {
			console.error('Error getting cloud cover:', error);
			return null;
		}
	}
}

export const stacService = new STACService();

export async function searchSTAC(bbox: number[], time: string) {
	return stacService.searchItems({ bbox, time });
}

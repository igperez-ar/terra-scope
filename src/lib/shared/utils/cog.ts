/**
 * Utility functions for working with Cloud-Optimized GeoTIFF (COG) data
 */

/**
 * Creates a proper COG tile URL for MapLibre GL
 */
export function createCOGTileURL(cogUrl: string): string {

	if (cogUrl.includes('.tif')) {
		return cogUrl.replace('.tif', '/{z}/{x}/{y}.png');
	}

	if (cogUrl.includes('sentinel-hub')) {
		return `${cogUrl}/tiles/{z}/{x}/{y}.png`;
	}

	return cogUrl;
}

/**
 * Gets COG metadata (bounds, bands, etc.)
 */
export async function getCOGMetadata(cogUrl: string): Promise<any> {
	try {
		const infoUrl = cogUrl.replace('.tif', '/info');
		const response = await fetch(infoUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch COG metadata: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.warn('Could not fetch COG metadata:', error);
		return null;
	}
}
import type { Map } from 'maplibre-gl';
import type { RasterLayer } from '$lib/config/raster-layers';
import { rasterLayerActions } from '../stores/raster';
import { createCOGTileURL } from '$lib/shared/utils/cog';

export class RasterLayerService {
	private map: Map | null = null;

	setMap(map: Map) {
		this.map = map;
	}

	addRasterLayer(layer: RasterLayer): string | null {
		if (!this.map) {
			console.error('Map not initialized');
			return null;
		}

		const sourceId = `raster-source-${layer.id}`;
		const layerId = `raster-layer-${layer.id}`;

		try {
			if (layer.type === 'cog') {
				const tileUrl = createCOGTileURL(layer.url);
				this.map.addSource(sourceId, {
					type: 'raster',
					tiles: [tileUrl],
					tileSize: 256
				});
			} else if (layer.type === 'xyz') {
				this.map.addSource(sourceId, {
					type: 'raster',
					tiles: [layer.url],
					tileSize: 256
				});
			} else if (layer.type === 'tms') {
				this.map.addSource(sourceId, {
					type: 'raster',
					tiles: [layer.url],
					tileSize: 256,
					scheme: 'tms'
				});
			}

			this.map.addLayer({
				id: layerId,
				type: 'raster',
				source: sourceId,
				paint: {
					'raster-opacity': layer.opacity ?? 1.0
				},
				layout: {
					visibility: layer.visible ? 'visible' : 'none'
				}
			});

			rasterLayerActions.setLayerId(layer.id, layerId);

			return layerId;
		} catch (error) {
			console.error(`Failed to add raster layer ${layer.id}:`, error);
			return null;
		}
	}

	removeRasterLayer(layerId: string): boolean {
		if (!this.map) {
			return false;
		}

		const mapLayerId = `raster-layer-${layerId}`;
		const sourceId = `raster-source-${layerId}`;

		try {
			if (this.map.getLayer(mapLayerId)) {
				this.map.removeLayer(mapLayerId);
			}
			if (this.map.getSource(sourceId)) {
				this.map.removeSource(sourceId);
			}
			return true;
		} catch (error) {
			console.error(`Failed to remove raster layer ${layerId}:`, error);
			return false;
		}
	}

	updateLayerOpacity(layerId: string, opacity: number): boolean {
		if (!this.map) {
			return false;
		}

		const mapLayerId = `raster-layer-${layerId}`;

		try {
			if (this.map.getLayer(mapLayerId)) {
				this.map.setPaintProperty(mapLayerId, 'raster-opacity', opacity);
				return true;
			}
			return false;
		} catch (error) {
			console.error(`Failed to update opacity for layer ${layerId}:`, error);
			return false;
		}
	}

	setLayerVisibility(layerId: string, visible: boolean): boolean {
		if (!this.map) {
			return false;
		}

		const mapLayerId = `raster-layer-${layerId}`;

		try {
			if (this.map.getLayer(mapLayerId)) {
				this.map.setLayoutProperty(mapLayerId, 'visibility', visible ? 'visible' : 'none');
				return true;
			}
			return false;
		} catch (error) {
			console.error(`Failed to set visibility for layer ${layerId}:`, error);
			return false;
		}
	}
}

export const rasterService = new RasterLayerService(); 
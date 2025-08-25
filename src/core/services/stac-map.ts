import type { STACItem } from './stac';
import type maplibregl from 'maplibre-gl';

export interface STACLayerConfig {
  id: string;
  item: STACItem;
  assetType: string;
  opacity: number;
  visible: boolean;
}

export class STACMapService {
  private map: maplibregl.Map | null = null;
  private layers: Map<string, STACLayerConfig> = new Map();

  setMap(map: maplibregl.Map) {
    this.map = map;
  }

  addSTACLayer(item: STACItem, assetType: string = 'visual'): string | null {
    if (!this.map) {
      console.error('Map not initialized');
      return null;
    }

    const asset = item.assets[assetType];
    if (!asset) {
      console.error(`Asset type '${assetType}' not found for item ${item.id}`);
      return null;
    }

    const layerId = `stac-${item.id}-${assetType}`;

    if (this.layers.has(layerId)) {
      console.warn(`Layer ${layerId} already exists`);
      return layerId;
    }

    try {
      const tileUrl = this.getTileUrl(item, assetType) || this.getFallbackTileUrl(asset.href);

      if (!tileUrl) {
        console.error('Could not generate tile URL for asset:', assetType);
        return null;
      }

      this.map.addSource(layerId, {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256
      });

      this.map.addLayer({
        id: layerId,
        type: 'raster',
        source: layerId,
        paint: {
          'raster-opacity': 1.0,
          'raster-resampling': 'linear'
        }
      });

      const layerConfig: STACLayerConfig = {
        id: layerId,
        item,
        assetType,
        opacity: 1.0,
        visible: true
      };

      this.layers.set(layerId, layerConfig);

      if (this.layers.size === 1 && item.bbox) {
        this.fitToItem(item);
      }

      return layerId;
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return null;
    }
  }

  removeSTACLayer(layerId: string): boolean {
    if (!this.map) {
      console.error('Map not initialized');
      return false;
    }

    if (!this.layers.has(layerId)) {
      console.warn(`Layer ${layerId} not found`);
      return false;
    }

    try {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }

      if (this.map.getSource(layerId)) {
        this.map.removeSource(layerId);
      }

      this.layers.delete(layerId);

      return true;
    } catch (error) {
      console.error('Error removing STAC layer:', error);
      return false;
    }
  }

  setLayerOpacity(layerId: string, opacity: number): boolean {
    if (!this.map) {
      console.error('Map not initialized');
      return false;
    }

    const layer = this.layers.get(layerId);
    if (!layer) {
      console.warn(`Layer ${layerId} not found`);
      return false;
    }

    try {
      this.map.setPaintProperty(layerId, 'raster-opacity', opacity);
      layer.opacity = opacity;
      return true;
    } catch (error) {
      console.error('Error setting layer opacity:', error);
      return false;
    }
  }

  setLayerVisibility(layerId: string, visible: boolean): boolean {
    if (!this.map) {
      console.error('Map not initialized');
      return false;
    }

    const layer = this.layers.get(layerId);
    if (!layer) {
      console.warn(`Layer ${layerId} not found`);
      return false;
    }

    try {
      if (visible) {
        this.map.setLayoutProperty(layerId, 'visibility', 'visible');
      } else {
        this.map.setLayoutProperty(layerId, 'visibility', 'none');
      }
      layer.visible = visible;
      return true;
    } catch (error) {
      console.error('Error setting layer visibility:', error);
      return false;
    }
  }

  getLayerConfig(layerId: string): STACLayerConfig | null {
    return this.layers.get(layerId) || null;
  }

  getAllLayers(): STACLayerConfig[] {
    return Array.from(this.layers.values());
  }

  clearAllLayers(): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    const layerIds = Array.from(this.layers.keys());
    layerIds.forEach(layerId => {
      this.removeSTACLayer(layerId);
    });
  }

  private getTileUrl(item: STACItem, assetType: string): string | null {
    try {
      const collection = this.getCollectionFromItem(item);
      if (!collection) {
        console.error('Could not determine collection from item:', item.id);
        return null;
      }

      // For Microsoft Planetary Computer, we use their tile service
      const baseUrl = 'https://planetarycomputer.microsoft.com/api/data/v1/item';
      const tileUrl = `${baseUrl}/${collection}/${item.id}/tiles/{z}/{x}/{y}`;

      return tileUrl;
    } catch (error) {
      console.error('Error generating tile URL:', error);
      return null;
    }
  }

  private getFallbackTileUrl(assetUrl: string): string | null {
    try {
      if (assetUrl.includes('planetarycomputer.microsoft.com')) {
        // Try to convert asset URL to tile URL
        if (assetUrl.includes('/items/')) {
          const fallbackUrl = assetUrl.replace('/items/', '/tiles/') + '/{z}/{x}/{y}';
          return fallbackUrl;
        } else {
          const fallbackUrl = assetUrl + '/{z}/{x}/{y}';
          return fallbackUrl;
        }
      }

      // For other providers, just append tile parameters
      const fallbackUrl = assetUrl + '/{z}/{x}/{y}';
      return fallbackUrl;
    } catch (error) {
      console.error('Error generating fallback tile URL:', error);
      return null;
    }
  }

  private getCollectionFromItem(item: STACItem): string | null {
    // Try to determine the collection from the item properties or links
    if (item.links) {
      const collectionLink = item.links.find(link => link.rel === 'collection');
      if (collectionLink && collectionLink.href) {
        // Extract collection name from href like "https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-2-l2a"
        const match = collectionLink.href.match(/\/collections\/([^\/]+)$/);
        if (match) {
          return match[1];
        }
      }
    }

    // Fallback: try to determine from item properties
    if (item.properties && item.properties.collection) {
      return item.properties.collection;
    }

    // Default to sentinel-2-l2a if we can't determine
    console.warn('Could not determine collection, defaulting to sentinel-2-l2a');
    return 'sentinel-2-l2a';
  }

  private fitToItem(item: STACItem): void {
    if (!this.map || !item.bbox) return;

    const [minX, minY, maxX, maxY] = item.bbox;
    this.map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY]
      ],
      {
        padding: 40,
        duration: 1500
      }
    );
  }

  static getLayerId(itemId: string, assetType: string): string {
    return `stac-${itemId}-${assetType}`;
  }

  hasLayer(layerId: string): boolean {
    return this.layers.has(layerId);
  }

  getAvailableAssetTypes(item: STACItem): string[] {
    return Object.keys(item.assets);
  }

  getBestVisualAsset(item: STACItem): string {
    // For Microsoft Planetary Computer, try these asset types in order
    const preferredAssets = ['visual', 'overview', 'thumbnail', 'data'];

    for (const assetType of preferredAssets) {
      if (item.assets[assetType]) {
        return assetType;
      }
    }

    // Fallback to first available asset
    const availableAssets = Object.keys(item.assets);
    const fallbackAsset = availableAssets[0] || 'visual';
    return fallbackAsset;
  }
}

export const stacMapService = new STACMapService(); 
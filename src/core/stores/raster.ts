import { writable } from 'svelte/store';
import type { RasterLayer } from '$lib/config/raster-layers';

export interface RasterLayerState {
	[id: string]: {
		visible: boolean;
		opacity: number;
		layerId?: string;
	};
}

export const rasterLayerStore = writable<RasterLayerState>({});

export const rasterLayerActions = {
	initializeLayers: (layers: RasterLayer[]) => {
		const initialState: RasterLayerState = {};
		layers.forEach(layer => {
			initialState[layer.id] = {
				visible: layer.visible ?? false,
				opacity: layer.opacity ?? 1.0
			};
		});
		rasterLayerStore.set(initialState);
	},

	toggleLayer: (layerId: string, visible?: boolean) => {
		rasterLayerStore.update(state => {
			if (state[layerId]) {
				state[layerId].visible = visible ?? !state[layerId].visible;
			}
			return state;
		});
	},

	setOpacity: (layerId: string, opacity: number) => {
		rasterLayerStore.update(state => {
			if (state[layerId]) {
				state[layerId].opacity = Math.max(0, Math.min(1, opacity));
			}
			return state;
		});
	},

	setLayerId: (layerId: string, mapLayerId: string) => {
		rasterLayerStore.update(state => {
			if (state[layerId]) {
				state[layerId].layerId = mapLayerId;
			}
			return state;
		});
	}
}; 
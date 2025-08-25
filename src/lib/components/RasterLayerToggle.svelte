<script lang="ts">
	import { rasterLayers } from '$lib/config/raster-layers';
	import { rasterLayerStore, rasterLayerActions } from '../../core/stores';
	import { get } from 'svelte/store';
	import { mapStore } from '../../core/stores';

	let store = get(rasterLayerStore);

	rasterLayerStore.subscribe(value => {
		store = value;
	});

	function toggleLayer(layerId: string, value?: boolean) {
		const visible = value ?? !store[layerId]?.visible;
		rasterLayerActions.toggleLayer(layerId, visible);
		
		const map = get(mapStore);
		if (map && store[layerId]?.layerId) {
			const mapLayerId = store[layerId].layerId!;
			map.setLayoutProperty(mapLayerId, 'visibility', visible ? 'visible' : 'none');
		}
	}

	function setOpacity(layerId: string, opacity: number) {
		rasterLayerActions.setOpacity(layerId, opacity);
		
		const map = get(mapStore);
		if (map && store[layerId]?.layerId) {
			const mapLayerId = store[layerId].layerId!;
			map.setPaintProperty(mapLayerId, 'raster-opacity', opacity);
		}
	}

	function toggleAll(show: boolean) {
		rasterLayers.forEach(layer => toggleLayer(layer.id, show));
	}
</script>

<div>
	<h2 class="mb-2 text-lg font-bold">Raster Layers</h2>

	<div class="mb-4 flex flex-row">
		<button 
			on:click={() => toggleAll(true)} 
			class="flex-1 mr-2 rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
		>
			Show All
		</button>
		<button 
			on:click={() => toggleAll(false)} 
			class="flex-1 rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
		>
			Hide All
		</button>
	</div>

	{#each rasterLayers as layer}
		<div class="mb-4 border-b border-gray-200 pb-3">
			<div class="mb-2 flex items-center">
				<input
					type="checkbox"
					checked={store[layer.id]?.visible ?? false}
					on:change={() => toggleLayer(layer.id)}
					class="mr-2"
				/>
				<span class="font-medium">{layer.name}</span>
			</div>
			
			{#if layer.description}
				<p class="mb-2 text-sm text-gray-600">{layer.description}</p>
			{/if}

			<div class="mb-2">
				<label for="opacity-{layer.id}" class="block text-sm text-gray-700 mb-1">Opacity</label>
				<input
					id="opacity-{layer.id}"
					type="range"
					min="0"
					max="1"
					step="0.1"
					value={store[layer.id]?.opacity ?? 1}
					on:input={(e) => {
						const target = e.target as HTMLInputElement;
						setOpacity(layer.id, parseFloat(target.value));
					}}
					class="w-full"
				/>
				<span class="text-xs text-gray-500">
					{Math.round((store[layer.id]?.opacity ?? 1) * 100)}%
				</span>
			</div>

			{#if layer.legend}
				<div class="text-xs text-gray-600">
					<span class="font-medium">Range:</span> {layer.legend.min} - {layer.legend.max}
					{#if layer.legend.unit}
						<span class="ml-1">({layer.legend.unit})</span>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div> 
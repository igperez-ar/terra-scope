<script lang="ts">
	import { layers } from '$lib/config/ecoregions';
	import { get } from 'svelte/store';
	import { mapStore } from '../../core/stores';

	const visibility: Record<number, boolean> = {};
	layers.forEach((layer) => (visibility[layer.id] = true));

	function toggleLayer(layerId: number, value?: boolean) {
		visibility[layerId] = value ?? !visibility[layerId];
		const map = get(mapStore);
		if (map) {
			const layerName = `layer-${layerId}`;
			map.setLayoutProperty(layerName, 'visibility', visibility[layerId] ? 'visible' : 'none');
		}
	}

	function toggleAll(show: boolean) {
		layers.forEach((layer) => toggleLayer(layer.id, show));
	}
</script>

<div>
	<h2 class="mb-2 text-lg font-bold">Layers</h2>

	<div class="mb-4 flex flex-row">
		<button on:click={() => toggleAll(true)} class="flex-1 mr-2 rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
			>Show All</button
		>
		<button on:click={() => toggleAll(false)} class="flex-1 mr-2 rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
			>Hide All</button
		>
	</div>

	{#each layers as layer}
		<div class="mb-1 flex items-center">
			<input
				type="checkbox"
				bind:checked={visibility[layer.id]}
				on:click={() => toggleLayer(layer.id)}
			/>
			<div
				class="mr-2 ml-2 h-4"
				style="background-color: {layer.color}; border:1px solid #000; aspect-ratio: 1"
			></div>
			<span>{layer.name}</span>
		</div>
	{/each}
</div>

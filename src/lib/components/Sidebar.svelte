<script lang="ts">
	import LayerToggle from './LayerToggle.svelte';
	import RasterLayerToggle from './RasterLayerToggle.svelte';
</script>

<div class="max-h-screen overflow-y-scroll w-100 bg-gray-100 p-4">
	<div class="border-t border-gray-300 bg-gray-50 p-4">
		<LayerToggle />
	</div>
	<div class="mt-4 border-t border-gray-300 bg-gray-50 p-4">
		<RasterLayerToggle />
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { layers } from '$lib/config/ecoregions';
	import { rasterLayers } from '$lib/config/raster-layers';
	import maplibregl from 'maplibre-gl';
	import bbox from '@turf/bbox';
	import { mapStore, rasterLayerActions } from '../../core/stores';
	import { rasterService } from '../../core/services';

	export let className = '';

	onMount(() => {
		const map = new maplibregl.Map({
			container: 'map',
			style: 'https://demotiles.maplibre.org/style.json'
		});

		mapStore.set(map);
		rasterService.setMap(map);

		rasterLayerActions.initializeLayers(rasterLayers);

		map.on('load', () => {
			map.addSource('ecoregions', {
				type: 'geojson',
				data: '/data/ecoregions.geojson'
			});

			layers.forEach(({ id, color }) => {
				map.addLayer({
					id: `layer-${id}`,
					type: 'fill',
					source: 'ecoregions',
					paint: {
						'fill-color': color,
						'fill-opacity': 0.6,
						'fill-outline-color': '#000000'
					},
					filter: ['==', ['get', 'id'], id]
				});
			});

			fetch('/data/ecoregions.geojson')
				.then((res) => res.json())
				.then((data) => {
					const [minX, minY, maxX, maxY] = bbox(data);
					map.fitBounds(
						[
							[minX, minY],
							[maxX, maxY]
						],
						{
							padding: 40,
							duration: 1500
						}
					);
				});

			rasterLayers.forEach((layer) => {
				rasterService.addRasterLayer(layer);
			});
		});
	});
</script>

<div id="map" class={className}></div>

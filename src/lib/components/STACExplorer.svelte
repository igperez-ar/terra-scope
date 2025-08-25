<script lang="ts">
	import { onMount } from 'svelte';
	import { stacService } from '../../core/services/stac';
	import {
		stacActions,
		stacSearchState,
		stacItems,
		stacSelectedItem
	} from '../../core/stores/stac';
	import { mapStore } from '../../core/stores/map';

	let searchForm: HTMLFormElement;
	let dateFrom: HTMLInputElement;
	let dateTo: HTMLInputElement;
	let limitSelect: HTMLSelectElement;

	$: searchState = $stacSearchState;
	$: items = $stacItems;
	$: selectedItem = $stacSelectedItem;

	onMount(() => {
		updateSearchFromMapBounds();
	});

	function updateSearchFromMapBounds() {
		const map = $mapStore;
		if (map) {
			try {
				const bounds = map.getBounds();
				const bboxCoords = [
					bounds.getWest(),
					bounds.getSouth(),
					bounds.getEast(),
					bounds.getNorth()
				];

				if (searchForm) {
					const bboxInput = searchForm.querySelector('[name="bbox"]') as HTMLInputElement;
					if (bboxInput) {
						bboxInput.value = bboxCoords.join(',');
					}
				}
			} catch (error) {
				console.error('Error getting map bounds:', error);
			}
		}
	}

	async function handleSearch(event: Event) {
		event.preventDefault();

		try {
			const formData = new FormData(searchForm);
			const searchParams: any = {};

			const bboxStr = formData.get('bbox') as string;
			if (bboxStr && bboxStr.trim()) {
				const bboxCoords = bboxStr.split(',').map(Number);
				if (bboxCoords.length === 4 && bboxCoords.every((coord) => !isNaN(coord))) {
					searchParams.bbox = bboxCoords;
				} else {
					throw new Error('Invalid bounding box format. Use: west,south,east,north');
				}
			}

			const fromDate = formData.get('dateFrom') as string;
			const toDate = formData.get('dateTo') as string;
			if (fromDate && toDate) {
				searchParams.datetime = `${fromDate}/${toDate}`;
			} else if (fromDate) {
				searchParams.datetime = `${fromDate}/..`;
			} else if (toDate) {
				searchParams.datetime = `../${toDate}`;
			}

			const limit = formData.get('limit') as string;
			if (limit) {
				searchParams.limit = parseInt(limit);
			}

			if (!searchParams.bbox && !searchParams.datetime) {
				throw new Error('Please provide either a bounding box or date range');
			}

			stacActions.setSearchLoading(true);
			const response = await stacService.searchItems(searchParams);

			stacActions.setSearchResults(
				response.features,
				response.context?.matched || response.features.length,
				response.context?.returned === response.context?.limit,
				searchParams
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Search failed';
			stacActions.setSearchError(errorMessage);
		}
	}

	function handleItemSelect(item: any) {
		stacActions.setSelectedItem(item);
	}

	function handleItemToggle(item: any) {
		try {
			stacActions.toggleItemVisibility(item.id);
		} catch (error) {
			console.error('Error toggling item visibility:', error);
		}
	}

	function handleClearResults() {
		stacActions.clearSearchResults();
	}

	function handleUseMapBounds() {
		updateSearchFromMapBounds();
	}

	function getCloudCoverColor(cloudCover: number | null): string {
		if (cloudCover === null) return 'text-gray-500';
		if (cloudCover <= 10) return 'text-green-600';
		if (cloudCover <= 30) return 'text-yellow-600';
		return 'text-red-600';
	}

	function getCloudCoverText(cloudCover: number | null): string {
		if (cloudCover === null) return 'Unknown';
		return `${cloudCover}%`;
	}
</script>

<div class="space-y-4">
	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="mb-2 text-lg font-semibold">Satellite Imagery Search</h3>
		<p class="text-sm text-gray-600">
			Search for satellite imagery from Microsoft Planetary Computer
		</p>
	</div>

	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="mb-3 text-lg font-semibold">Search Parameters</h3>
		<form bind:this={searchForm} on:submit={handleSearch} class="space-y-4">
			<div>
				<label for="bbox" class="mb-1 block text-sm font-medium text-gray-700">
					Bounding Box (W,S,E,N)
				</label>
				<div class="flex space-x-2">
					<input
						id="bbox"
						type="text"
						name="bbox"
						placeholder="3.0,50.0,8.0,54.0"
						class="flex-1 rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="button"
						on:click={handleUseMapBounds}
						class="rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
					>
						Use Map
					</button>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="dateFrom" class="mb-1 block text-sm font-medium text-gray-700"
						>From Date</label
					>
					<input
						id="dateFrom"
						bind:this={dateFrom}
						type="date"
						name="dateFrom"
						class="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label for="dateTo" class="mb-1 block text-sm font-medium text-gray-700">To Date</label>
					<input
						id="dateTo"
						bind:this={dateTo}
						type="date"
						name="dateTo"
						class="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			<div>
				<label for="limit" class="mb-1 block text-sm font-medium text-gray-700">Results Limit</label
				>
				<select
					id="limit"
					bind:this={limitSelect}
					name="limit"
					class="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
				>
					<option value="10">10</option>
					<option value="20" selected>20</option>
					<option value="50">50</option>
					<option value="100">100</option>
				</select>
			</div>

			<div class="flex space-x-2">
				<button
					type="submit"
					disabled={searchState.isLoading}
					class="flex-1 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{searchState.isLoading ? 'Searching...' : 'Search'}
				</button>
				<button
					type="button"
					on:click={handleClearResults}
					class="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
				>
					Clear
				</button>
			</div>
		</form>

		{#if searchState.error}
			<div class="mt-4 rounded-md border border-red-400 bg-red-100 p-3 text-red-700">
				<strong>Error:</strong>
				{searchState.error}
			</div>
		{/if}
	</div>

	{#if items.length > 0}
		<div class="rounded-lg bg-white p-4 shadow">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-lg font-semibold">
					Results ({searchState.totalResults})
				</h3>
			</div>

			<div class="max-h-96 space-y-3 overflow-y-auto">
				{#each items as item}
					<button
						type="button"
						class="w-full cursor-pointer rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50 {selectedItem?.id ===
						item.id
							? 'border-blue-300 bg-blue-50'
							: ''}"
						on:click={() => handleItemSelect(item)}
						on:keydown={(e) => e.key === 'Enter' && handleItemSelect(item)}
					>
						<div class="flex items-start space-x-3">
							<div class="flex-shrink-0">
								{#if stacService.getThumbnailUrl(item)}
									<img
										src={stacService.getThumbnailUrl(item)}
										alt="Thumbnail"
										class="h-16 w-16 rounded border object-cover"
										on:error={(e) => {
											const target = e.target as HTMLImageElement;
											if (target) target.style.display = 'none';
										}}
									/>
								{:else}
									<div
										class="flex h-16 w-16 items-center justify-center rounded border bg-gray-200"
									>
										<span class="text-xs text-gray-500">No preview</span>
									</div>
								{/if}
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between">
									<h4 class="truncate text-sm font-medium text-gray-900">
										{item.properties.title || item.id}
									</h4>
									<div
										on:click|stopPropagation={() => handleItemToggle(item)}
										on:keydown|stopPropagation={(e) => e.key === 'Enter' && handleItemToggle(item)}
										role="button"
										tabindex="0"
										class="cursor-pointer rounded px-2 py-1 text-xs {stacActions.isItemVisible(
											item.id
										)
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'}"
									>
										{stacActions.isItemVisible(item.id) ? 'Visible' : 'Show'}
									</div>
								</div>

								<p class="mt-1 text-xs text-gray-500">
									{stacService.formatDatetime(item.properties.datetime)}
								</p>

								<div class="mt-2 flex items-center space-x-4 text-xs text-gray-600">
									<span>Platform: {item.properties.platform || 'Unknown'}</span>
									<span class={getCloudCoverColor(stacService.getCloudCover(item))}>
										Cloud: {getCloudCoverText(stacService.getCloudCover(item))}
									</span>
									{#if item.properties.gsd}
										<span>GSD: {item.properties.gsd}m</span>
									{/if}
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if selectedItem}
		<div class="rounded-lg bg-white p-4 shadow">
			<h3 class="mb-3 text-lg font-semibold">Item Details</h3>
			<div class="space-y-3">
				<div>
					<strong>ID:</strong>
					{selectedItem.id}
				</div>
				<div>
					<strong>Date:</strong>
					{stacService.formatDatetime(selectedItem.properties.datetime)}
				</div>
				<div>
					<strong>Platform:</strong>
					{selectedItem.properties.platform || 'Unknown'}
				</div>
				<div>
					<strong>Cloud Cover:</strong>
					<span class={getCloudCoverColor(stacService.getCloudCover(selectedItem))}>
						{getCloudCoverText(stacService.getCloudCover(selectedItem))}
					</span>
				</div>
				{#if selectedItem.properties.gsd}
					<div>
						<strong>Ground Sample Distance:</strong>
						{selectedItem.properties.gsd}m
					</div>
				{/if}
				{#if selectedItem.properties.description}
					<div>
						<strong>Description:</strong>
						{selectedItem.properties.description}
					</div>
				{/if}

				<div>
					<strong>Available Assets:</strong>
					<div class="mt-2 space-y-1">
						{#each Object.entries(selectedItem.assets) as [key, asset]}
							<div class="text-sm">
								<span class="font-medium">{key}:</span>
								{asset.title || asset.type}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

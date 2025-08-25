<script lang="ts">
	import Map from '$lib/map/Map.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="flex h-screen">
	<Sidebar />
	<Map className="flex-1" />
</div>

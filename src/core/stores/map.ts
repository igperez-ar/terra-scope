import { writable } from 'svelte/store';

export const mapStore = writable<maplibregl.Map>();

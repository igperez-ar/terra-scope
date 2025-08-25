export interface RasterLayer {
	id: string;
	name: string;
	description?: string;
	url: string;
	type: 'cog' | 'xyz' | 'tms';
	opacity?: number;
	visible?: boolean;
	legend?: {
		min: number;
		max: number;
		unit?: string;
		colors?: string[];
	};
}

export const rasterLayers: RasterLayer[] = [
	{
		id: 'elevation',
		name: 'Digital Elevation Model',
		description: 'High-resolution elevation data',
		url: 'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
		type: 'xyz',
		opacity: 0.8,
		visible: false,
		legend: {
			min: -50,
			max: 300,
			unit: 'meters',
			colors: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
		}
	},
	{
		id: 'satellite',
		name: 'Satellite Imagery',
		description: 'High-resolution satellite imagery',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		type: 'xyz',
		opacity: 0.6,
		visible: false
	},
]; 
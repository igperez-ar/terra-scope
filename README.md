# TerraScope

A web application for exploring geospatial data using interactive maps, satellite imagery, and environmental datasets.

## 🚀 Functionalities

### Interactive Map Interface
- **Vector Layers**: Display ecoregions with color-coded boundaries
- **Raster Overlays**: Add elevation data and satellite imagery layers
- **Layer Management**: Toggle visibility and adjust opacity for all layers

### Satellite Imagery Search (STAC Integration)
- **Microsoft Planetary Computer**: Access high-quality Sentinel-2 satellite imagery
- **Geographic Search**: Search by bounding box coordinates or use current map bounds
- **Temporal Filtering**: Filter imagery by date ranges
- **Rich Metadata**: View thumbnails, cloud cover, resolution, and platform information
- **Interactive Display**: One-click layer toggling with automatic asset selection

### Environmental Data Visualization
- **Ecoregions**: 15 distinct ecological regions with custom color coding
- **Elevation Data**: High-resolution digital elevation model
- **Satellite Imagery**: Real-time access to current and historical satellite data
- **Legend Support**: Color-coded legends for raster data interpretation

## 🎯 Design Decisions

### Technology Stack
- **SvelteKit**: Modern, lightweight framework for fast, reactive web applications
- **MapLibre GL**: Open-source mapping library with excellent performance
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS for rapid UI development

### Architecture Choices
- **Store-based State Management**: Centralized state with Svelte stores for predictable data flow
- **Service Layer Pattern**: Clean separation between UI, business logic, and external APIs
- **Configuration-driven**: Easy to add new layers and data sources without code changes
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Data Sources
- **Microsoft Planetary Computer**: Reliable, high-quality satellite imagery with rich metadata
- **Cloud-Optimized GeoTIFF (COG)**: Efficient raster data format for web applications
- **GeoJSON**: Standard format for vector data with good browser support

### User Experience
- **Sidebar Interface**: Clean, organized controls that don't obstruct the map view
- **Real-time Feedback**: Immediate visual feedback for all user interactions
- **Progressive Enhancement**: Core functionality works even with limited connectivity
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 22)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd terra-scope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 How to Use

### Basic Map Navigation
1. **Pan**: Click and drag to move around the map
2. **Zoom**: Use mouse wheel or zoom controls
3. **Layer Toggle**: Use the sidebar to show/hide different layers

### Exploring Ecoregions
1. Open the "Ecoregions" section in the sidebar
2. Toggle individual regions on/off to explore different ecological areas
3. Each region is color-coded for easy identification

### Adding Raster Layers
1. Go to the "Raster Layers" section in the sidebar
2. Toggle "Digital Elevation Model" to see elevation data
3. Toggle "Satellite Imagery" for current satellite views
4. Adjust opacity sliders to blend layers together

### Searching Satellite Imagery
1. Navigate to the "Satellite Imagery Search" section
2. **Set Geographic Bounds**:
   - Enter coordinates manually (format: west,south,east,north)
   - Or click "Use Map" to use current map bounds
3. **Set Date Range** (optional):
   - Choose start and end dates for temporal filtering
4. **Search**: Click "Search" to find available imagery
5. **View Results**: Browse thumbnails and metadata

### Understanding Results
- **Thumbnails**: Visual preview of satellite imagery
- **Cloud Cover**: Color-coded indicators (green=low, yellow=medium, red=high)
- **Platform**: Satellite platform information
- **Resolution**: Ground sample distance in meters
- **Date**: Acquisition date and time

## 🔧 Configuration

### Adding New Raster Layers
Edit `src/lib/config/raster-layers.ts`:

```typescript
{
  id: 'my-layer',
  name: 'My Custom Layer',
  url: 'https://your-service.com/tiles/{z}/{x}/{y}.png',
  type: 'xyz',
  opacity: 0.8,
  visible: false
}
```

### Modifying Ecoregions
Edit `src/lib/config/ecoregions.ts` to change colors or add new regions.

## 🐛 Troubleshooting

### Common Issues

**Map not loading**
- Check your internet connection
- Ensure all dependencies are installed correctly
- Check browser console for error messages

**Satellite imagery search fails**
- Verify your internet connection
- Check that date ranges are valid
- Ensure bounding box coordinates are in correct format

**Layers not displaying**
- Check layer visibility settings in sidebar
- Verify layer opacity is not set to 0
- Check browser console for tile loading errors

### Getting Help
- Check the browser console for detailed error messages
- Review the network tab for failed requests
- Ensure all required services are accessible

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

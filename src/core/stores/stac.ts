import { writable, derived } from 'svelte/store';
import type { STACItem, STACSearchParams } from '../services/stac';
import { stacMapService } from '../services/stac-map';

export interface STACSearchState {
  isLoading: boolean;
  error: string | null;
  items: STACItem[];
  totalResults: number;
  hasMore: boolean;
  searchParams: STACSearchParams | null;
}

export interface STACState {
  searchState: STACSearchState;
  selectedItem: STACItem | null;
  visibleItems: Set<string>;
}

const initialState: STACState = {
  searchState: {
    isLoading: false,
    error: null,
    items: [],
    totalResults: 0,
    hasMore: false,
    searchParams: null
  },
  selectedItem: null,
  visibleItems: new Set()
};

export const stacStore = writable<STACState>(initialState);

export const stacSearchState = derived(stacStore, $stacStore => $stacStore.searchState);
export const stacItems = derived(stacStore, $stacStore => $stacStore.searchState.items);
export const stacSelectedItem = derived(stacStore, $stacStore => $stacStore.selectedItem);
export const stacVisibleItems = derived(stacStore, $stacStore => $stacStore.visibleItems);

export const stacActions = {
  setSearchLoading: (isLoading: boolean) => {
    stacStore.update(state => ({
      ...state,
      searchState: {
        ...state.searchState,
        isLoading,
        error: isLoading ? null : state.searchState.error
      }
    }));
  },

  setSearchError: (error: string | null) => {
    stacStore.update(state => ({
      ...state,
      searchState: {
        ...state.searchState,
        error,
        isLoading: false
      }
    }));
  },

  setSearchResults: (items: STACItem[], totalResults: number, hasMore: boolean, searchParams: STACSearchParams) => {
    stacStore.update(state => ({
      ...state,
      searchState: {
        ...state.searchState,
        items,
        totalResults,
        hasMore,
        searchParams,
        isLoading: false,
        error: null
      }
    }));
  },

  clearSearchResults: () => {
    stacStore.update(state => ({
      ...state,
      searchState: {
        ...state.searchState,
        items: [],
        totalResults: 0,
        hasMore: false,
        searchParams: null,
        error: null
      }
    }));
  },

  setSelectedItem: (item: STACItem | null) => {
    stacStore.update(state => ({
      ...state,
      selectedItem: item
    }));
  },

  toggleItemVisibility: (itemId: string) => {
    stacStore.update(state => {
      const newVisibleItems = new Set(state.visibleItems);
      const item = state.searchState.items.find(i => i.id === itemId);

      if (newVisibleItems.has(itemId)) {
        try {
          const assetType = stacMapService.getBestVisualAsset(item || state.searchState.items[0]);
          const layerId = `stac-${itemId}-${assetType}`;
          if (stacMapService.hasLayer(layerId)) {
            stacMapService.removeSTACLayer(layerId);
          }
        } catch (error) {
          console.error('Error removing STAC layer:', error);
        }
        newVisibleItems.delete(itemId);
      } else {
        if (item) {
          try {
            const assetType = stacMapService.getBestVisualAsset(item);
            const layerId = stacMapService.addSTACLayer(item, assetType);

            if (layerId) {
              newVisibleItems.add(itemId);
            } else {
              console.error('Failed to add layer, not updating visible items');
              return state;
            }
          } catch (error) {
            console.error('Error adding STAC layer:', error);
            return state;
          }
        } else {
          console.error('Item not found in search results');
          return state;
        }
      }

      return {
        ...state,
        visibleItems: newVisibleItems
      };
    });
  },

  setItemVisibility: (itemId: string, visible: boolean) => {
    stacStore.update(state => {
      const newVisibleItems = new Set(state.visibleItems);
      const item = state.searchState.items.find(i => i.id === itemId);

      if (visible) {
        if (item) {
          try {
            const assetType = stacMapService.getBestVisualAsset(item);
            stacMapService.addSTACLayer(item, assetType);
          } catch (error) {
            console.error('Error adding STAC layer:', error);
            return state;
          }
        }
        newVisibleItems.add(itemId);
      } else {
        try {
          const assetType = stacMapService.getBestVisualAsset(item || state.searchState.items[0]);
          const layerId = `stac-${itemId}-${assetType}`;
          if (stacMapService.hasLayer(layerId)) {
            stacMapService.removeSTACLayer(layerId);
          }
        } catch (error) {
          console.error('Error removing STAC layer:', error);
        }
        newVisibleItems.delete(itemId);
      }

      return {
        ...state,
        visibleItems: newVisibleItems
      };
    });
  },

  clearVisibleItems: () => {
    try {
      stacMapService.clearAllLayers();
    } catch (error) {
      console.error('Error clearing STAC layers:', error);
    }
    stacStore.update(state => ({
      ...state,
      visibleItems: new Set()
    }));
  },

  isItemVisible: (itemId: string): boolean => {
    let result = false;
    stacStore.subscribe(state => {
      result = state.visibleItems.has(itemId);
    })();
    return result;
  },

  getVisibleItems: (): STACItem[] => {
    let result: STACItem[] = [];
    stacStore.subscribe(state => {
      result = state.searchState.items.filter(item =>
        state.visibleItems.has(item.id)
      );
    })();
    return result;
  }
}; 
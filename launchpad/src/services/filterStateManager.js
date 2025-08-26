import { getFilterConfig, getFirebaseFilters, isClientSideFilter } from './filterConfig';

class FilterStateManager {
  constructor(initialFilters = {}, collectionType = 'users') {
    this.collectionType = collectionType;
    this.filters = this.initializeFilters(initialFilters);
    this.activeFilters = new Set();
    this.filterHistory = [];
    this.maxHistorySize = 10;
  }

  // Initialize filters with default values
  initializeFilters(initialFilters) {
    const filters = {};
    
    // Get all available filters for this collection type
    const allFilters = this.collectionType === 'users' 
      ? Object.keys(require('./filterConfig').USER_FILTERS)
      : Object.keys(require('./filterConfig').OPPORTUNITY_FILTERS);

    allFilters.forEach(filterId => {
      const config = getFilterConfig(filterId, this.collectionType);
      if (config) {
        const defaultValue = config.options?.find(opt => opt.default)?.value || null;
        filters[filterId] = initialFilters[filterId] || defaultValue;
        
        if (filters[filterId] && !filters[filterId].toString().startsWith('any_')) {
          this.activeFilters.add(filterId);
        }
      }
    });

    return filters;
  }

  // Update a specific filter
  updateFilter(filterId, value) {
    const config = getFilterConfig(filterId, this.collectionType);
    if (!config) {
      console.warn(`Filter ${filterId} not found`);
      return false;
    }

    // Validate the value
    if (!this.validateFilterValue(config, value)) {
      console.warn(`Invalid value for filter ${filterId}:`, value);
      return false;
    }

    // Store previous state for history
    this.addToHistory(filterId, this.filters[filterId], value);

    // Update the filter
    this.filters[filterId] = value;

    // Update active filters set
    if (value && !value.toString().startsWith('any_')) {
      this.activeFilters.add(filterId);
    } else {
      this.activeFilters.delete(filterId);
    }

    return true;
  }

  // Update multiple filters at once
  updateFilters(filterUpdates) {
    const results = {};
    
    Object.entries(filterUpdates).forEach(([filterId, value]) => {
      results[filterId] = this.updateFilter(filterId, value);
    });

    return results;
  }

  // Reset a specific filter to default
  resetFilter(filterId) {
    const config = getFilterConfig(filterId, this.collectionType);
    if (config) {
      const defaultValue = config.options?.find(opt => opt.default)?.value || null;
      this.updateFilter(filterId, defaultValue);
    }
  }

  // Reset all filters to defaults
  resetAllFilters() {
    const allFilters = this.collectionType === 'users' 
      ? Object.keys(require('./filterConfig').USER_FILTERS)
      : Object.keys(require('./filterConfig').OPPORTUNITY_FILTERS);

    allFilters.forEach(filterId => {
      this.resetFilter(filterId);
    });
  }

  // Get current filter values
  getFilters() {
    return { ...this.filters };
  }

  // Get only active (non-default) filters
  getActiveFilters() {
    const active = {};
    this.activeFilters.forEach(filterId => {
      active[filterId] = this.filters[filterId];
    });
    return active;
  }

  // Get filters that should be applied on Firebase
  getFirebaseFilters() {
    return getFirebaseFilters(this.filters, this.collectionType);
  }

  // Get filters that should be applied client-side
  getClientSideFilters() {
    const clientSide = {};
    
    Object.entries(this.filters).forEach(([filterId, value]) => {
      if (isClientSideFilter(filterId) && value && !value.toString().startsWith('any_')) {
        clientSide[filterId] = value;
      }
    });

    return clientSide;
  }

  // Check if any filters are active
  hasActiveFilters() {
    return this.activeFilters.size > 0;
  }

  // Get count of active filters
  getActiveFilterCount() {
    return this.activeFilters.size;
  }

  // Validate filter value against its configuration
  validateFilterValue(config, value) {
    if (!config) return false;

    // Handle null/undefined values
    if (value === null || value === undefined) {
      return true; // Allow null values for resetting
    }

    switch (config.type) {
      case 'select':
        return config.options?.some(opt => opt.value === value) || false;
      
      case 'multi_select':
        if (Array.isArray(value)) {
          return value.every(v => config.options?.some(opt => opt.value === v));
        }
        return config.options?.some(opt => opt.value === value);
      
      case 'search_select':
        return config.options?.some(opt => opt.value === value) || false;
      
      case 'range':
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return typeof value.min === 'number' && typeof value.max === 'number' && value.min <= value.max;
        }
        return false;
      
      case 'date_range':
        if (typeof value === 'object' && value.start !== undefined && value.end !== undefined) {
          return value.start instanceof Date && value.end instanceof Date && value.start <= value.end;
        }
        return false;
      
      case 'boolean':
        return typeof value === 'boolean';
      
      case 'tag_input':
        return Array.isArray(value) && value.every(v => typeof v === 'string');
      
      default:
        return true;
    }
  }

  // Add filter change to history
  addToHistory(filterId, oldValue, newValue) {
    const historyEntry = {
      filterId,
      oldValue,
      newValue,
      timestamp: Date.now()
    };

    this.filterHistory.push(historyEntry);

    // Keep only the last N entries
    if (this.filterHistory.length > this.maxHistorySize) {
      this.filterHistory.shift();
    }
  }

  // Undo last filter change
  undoLastChange() {
    if (this.filterHistory.length === 0) return false;

    const lastChange = this.filterHistory.pop();
    this.updateFilter(lastChange.filterId, lastChange.oldValue);
    return true;
  }

  // Get filter change history
  getHistory() {
    return [...this.filterHistory];
  }

  // Clear filter history
  clearHistory() {
    this.filterHistory = [];
  }

  // Export current filter state
  exportFilters() {
    return {
      filters: this.getFilters(),
      activeFilters: Array.from(this.activeFilters),
      collectionType: this.collectionType,
      timestamp: Date.now()
    };
  }

  // Import filter state
  importFilters(filterState) {
    if (filterState.collectionType !== this.collectionType) {
      console.warn('Collection type mismatch during filter import');
      return false;
    }

    this.filters = { ...filterState.filters };
    this.activeFilters = new Set(filterState.activeFilters || []);
    
    return true;
  }

  // Subscribe to filter changes
  subscribe(callback) {
    if (!this.subscribers) {
      this.subscribers = new Set();
    }
    
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify subscribers of filter changes
  notifySubscribers(filterId, oldValue, newValue) {
    if (this.subscribers) {
      this.subscribers.forEach(callback => {
        try {
          callback(filterId, oldValue, newValue, this.getFilters());
        } catch (error) {
          console.error('Error in filter subscriber callback:', error);
        }
      });
    }
  }
}

export default FilterStateManager;

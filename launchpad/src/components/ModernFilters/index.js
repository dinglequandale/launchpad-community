// Modern Filter Components Index
export { default as BaseFilter } from './BaseFilter';
export { default as MultiSelectFilter } from './MultiSelectFilter';
export { default as ModernFilterPanel } from './ModernFilterPanel';

// Re-export filter configuration and services
export { 
  FILTER_TYPES, 
  FILTER_OPERATORS, 
  USER_FILTERS, 
  OPPORTUNITY_FILTERS, 
  FILTER_GROUPS,
  getFilterConfig,
  getFilterGroup,
  isClientSideFilter,
  getFirebaseFilters
} from '../../services/filterConfig';

export { default as FilterStateManager } from '../../services/filterStateManager';
export { default as EnhancedFilteringService } from '../../services/enhancedFilteringService';

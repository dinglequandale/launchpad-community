import React, { useState, useCallback, useMemo } from 'react';
import { BiFilter, BiX, BiReset } from 'react-icons/bi';
import MultiSelectFilter from './MultiSelectFilter';
import { getFilterConfig, getFilterGroup } from '../../services/filterConfig';
import './ModernFilterPanel.css';

const ModernFilterPanel = ({
  filterGroup = 'network',
  filters = {},
  onFilterChange,
  onClearAll,
  onReset,
  disabled = false,
  className = '',
  showFilterCount = true,
  collapsible = true,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [activeFilters, setActiveFilters] = useState(new Set());

  // Get filter group configuration
  const groupConfig = useMemo(() => getFilterGroup(filterGroup), [filterGroup]);

  // Track active filters
  useMemo(() => {
    const active = new Set();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && !value.toString().startsWith('any_')) {
        active.add(key);
      }
    });
    setActiveFilters(active);
  }, [filters]);

  // Handle individual filter changes
  const handleFilterChange = useCallback((filterId, value) => {
    if (onFilterChange) {
      onFilterChange(filterId, value);
    }
  }, [onFilterChange]);

  // Handle filter clear
  const handleFilterClear = useCallback((filterId) => {
    const config = getFilterConfig(filterId);
    if (config) {
      const defaultValue = config.options?.find(opt => opt.default)?.value || null;
      handleFilterChange(filterId, defaultValue);
    }
  }, [handleFilterChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
  }, [onClearAll]);

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Get filter count
  const filterCount = activeFilters.size;

  // Render individual filter
  const renderFilter = useCallback((filterId) => {
    const config = getFilterConfig(filterId);
    if (!config) return null;

    const currentValue = filters[filterId];
    
    switch (config.type) {
      case 'multi_select':
        return (
          <MultiSelectFilter
            key={filterId}
            config={config}
            value={currentValue}
            onChange={(value) => handleFilterChange(filterId, value)}
            onClear={() => handleFilterClear(filterId)}
            disabled={disabled}
          />
        );
      
      case 'select':
        return (
          <MultiSelectFilter
            key={filterId}
            config={{
              ...config,
              type: 'multi_select'
            }}
            value={currentValue ? [currentValue] : []}
            onChange={(value) => handleFilterChange(filterId, value[0] || null)}
            onClear={() => handleFilterClear(filterId)}
            disabled={disabled}
          />
        );
      
      // Add more filter types here as needed
      default:
        return null;
    }
  }, [filters, handleFilterChange, handleFilterClear, disabled]);

  if (!groupConfig) {
    console.warn(`Filter group '${filterGroup}' not found`);
    return null;
  }

  return (
    <div className={`modern-filter-panel ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Panel Header */}
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <BiFilter size={20} className="filter-icon" />
          <h3>{groupConfig.title}</h3>
          {groupConfig.description && (
            <p className="filter-panel-description">{groupConfig.description}</p>
          )}
        </div>
        
        <div className="filter-panel-actions">
          {showFilterCount && filterCount > 0 && (
            <span className="filter-count-badge">
              {filterCount} active
            </span>
          )}
          
          {collapsible && (
            <button
              className="collapse-button"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
              title={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              <BiX 
                size={20} 
                className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="filter-panel-content">
          {/* Filters Grid */}
          <div className="filters-grid">
            {groupConfig.filters.map(renderFilter)}
          </div>

          {/* Panel Actions */}
          {(filterCount > 0 || onReset) && (
            <div className="filter-panel-actions-footer">
              {filterCount > 0 && (
                <button
                  className="clear-all-filters-button"
                  onClick={handleClearAll}
                  type="button"
                >
                  <BiX size={16} />
                  Clear All Filters
                </button>
              )}
              
              {onReset && (
                <button
                  className="reset-filters-button"
                  onClick={handleReset}
                  type="button"
                >
                  <BiReset size={16} />
                  Reset to Defaults
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collapsed State Indicator */}
      {isCollapsed && filterCount > 0 && (
        <div className="filter-panel-collapsed-indicator">
          <span className="collapsed-filter-count">
            {filterCount} filter{filterCount !== 1 ? 's' : ''} active
          </span>
          <button
            className="expand-filters-button"
            onClick={toggleCollapse}
            type="button"
          >
            Show Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernFilterPanel;

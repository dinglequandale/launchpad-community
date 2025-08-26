import React, { useState, useMemo } from 'react';
import BaseFilter from './BaseFilter';
import './MultiSelectFilter.css';

const MultiSelectFilter = ({ 
  config, 
  value = [], 
  onChange, 
  onClear,
  disabled = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return config.options || [];
    }
    
    return (config.options || []).filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [config.options, searchQuery]);

  // Handle option selection/deselection
  const handleOptionChange = (optionValue) => {
    if (!onChange) return;

    let newValue;
    
    if (optionValue.startsWith('any_')) {
      // Handle "any" options - clear all other selections
      newValue = value.includes(optionValue) ? [] : [optionValue];
    } else {
      // Handle regular options
      const withoutAny = value.filter(v => !v.startsWith('any_'));
      
      if (withoutAny.includes(optionValue)) {
        // Remove option
        newValue = withoutAny.filter(v => v !== optionValue);
      } else {
        // Add option
        newValue = [...withoutAny, optionValue];
      }
      
      // If we're adding a regular option, remove "any" options
      if (newValue.length > 0) {
        newValue = newValue.filter(v => !v.startsWith('any_'));
      }
    }
    
    onChange(newValue);
  };

  // Handle clear all
  const handleClearAll = () => {
    if (onClear) {
      onClear();
    }
  };

  // Check if option is selected
  const isOptionSelected = (optionValue) => {
    return value.includes(optionValue);
  };

  // Get display value
  const getDisplayValue = () => {
    if (!value || value.length === 0) return null;
    
    if (value.length === 1) {
      const option = config.options?.find(opt => opt.value === value[0]);
      return option?.label || value[0];
    }
    
    return `${value.length} selected`;
  };

  // Check if "any" option is selected
  const hasAnyOption = value.some(v => v.startsWith('any_'));

  return (
    <BaseFilter
      config={{
        ...config,
        searchable: true
      }}
      value={getDisplayValue()}
      onClear={handleClearAll}
      disabled={disabled}
      className={`multi-select-filter ${className}`}
    >
      {/* Search functionality is handled by BaseFilter */}
      
      {/* Options List */}
      <div className="filter-options">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <label
              key={option.value}
              className={`filter-option ${isOptionSelected(option.value) ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={isOptionSelected(option.value)}
                onChange={() => handleOptionChange(option.value)}
                disabled={option.disabled}
                className="option-checkbox"
              />
              <span className="option-label">{option.label}</span>
              {option.description && (
                <span className="option-description">{option.description}</span>
              )}
            </label>
          ))
        ) : (
          <div className="no-options">
            <p>No options found</p>
            {searchQuery && (
              <button 
                className="clear-search-suggestion"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {value && value.length > 0 && (
        <div className="filter-actions-footer">
          <button
            className="clear-all-button"
            onClick={handleClearAll}
            type="button"
          >
            Clear All
          </button>
          <button
            className="apply-button"
            onClick={() => {}} // Close dropdown
            type="button"
          >
            Apply
          </button>
        </div>
      )}
    </BaseFilter>
  );
};

export default MultiSelectFilter;

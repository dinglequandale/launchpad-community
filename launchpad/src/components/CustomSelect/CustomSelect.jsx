import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { BiX } from 'react-icons/bi';
import './CustomSelect.css';
import Loading from '../LoadingAnimation/Loading';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  isMulti = false,
  isSearchable = false,
  isDisabled = false,
  className = "",
  onSearchQueryChange,
  isLoading = false,
  loadingMessage = "Loading...",
  noOptionsMessage = "No options available"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search query
  const safeOptions = Array.isArray(options) ? options : [];
  const filteredOptions = safeOptions.filter(option => {
    if (!searchQuery) return true;
    const label = typeof option === 'string' ? option : option.label || option.value;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleOptionSelect(filteredOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, filteredOptions]);

  const handleOptionSelect = (option) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;

      if (currentValues.includes(optionLabel)) {
        // Remove if already selected
        const newValues = currentValues.filter(v => v !== optionLabel);
        onChange(newValues);
      } else {
        // Add if not selected
        const newValues = [...currentValues, optionLabel];
        onChange(newValues);
      }
      // Clear search input for multiselect but keep dropdown open
      setInputValue('');
      setSearchQuery('');
    } else {
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;
      onChange(optionLabel);
      setIsOpen(false);
      setSearchQuery('');
      setInputValue('');
    }
    setFocusedIndex(-1);
  };

  const handleRemoveOption = (optionToRemove) => {
    if (isMulti && Array.isArray(value)) {
      const newValues = value.filter(v => {
        if (typeof v === 'string' && typeof optionToRemove === 'string') {
          return v !== optionToRemove;
        } else if (typeof v === 'object' && typeof optionToRemove === 'object') {
          return (v.value || v.label) !== (optionToRemove.value || optionToRemove.label);
        }
        return true;
      });
      onChange(newValues);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchQuery(newValue);
    if (onSearchQueryChange) {
      onSearchQueryChange(newValue);
    }
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (isSearchable) {
      setIsOpen(true);
      // Ensure the input has focus and cursor is visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const toggleDropdown = () => {
    if (!isDisabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      if (newIsOpen && isSearchable) {
        // Focus the input after a brief delay to ensure the dropdown is open
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } else if (!newIsOpen) {
        // Clear input value when closing dropdown to show placeholder again
        setInputValue('');
        setSearchQuery('');
      }
    }
  };

  const getDisplayValue = () => {
    if (isMulti) {
      if (!Array.isArray(value) || value.length === 0) return '';
      return value.map(val => getOptionLabel(val)).join(', ');
    }
    return getOptionLabel(value) || '';
  };

  const getOptionLabel = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.label || option.value || '';
  };

  const getOptionValue = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    return option.value || option.label || '';
  };

  return (
    <div className={`custom-select ${className}`} ref={containerRef}>
      <div 
        className={`select-trigger ${isOpen ? 'open' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
      >
        {isMulti && Array.isArray(value) && value.length > 0 ? (
          <div className="multi-value-container">
            {/* When dropdown is open, show all selected items */}
            {(isOpen ? value : value.slice(0, 2)).map((val, index) => (
              <span key={index} className="multi-value">
                {getOptionLabel(val)}
                <button
                  type="button"
                  className="remove-value"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(val);
                  }}
                >
                  <BiX size={14} />
                </button>
              </span>
            ))}
            {/* Only show "+X more" when dropdown is closed */}
            {!isOpen && value.length > 2 && (
              <span className="more-values">+{value.length - 2} more</span>
            )}
            {/* Search input positioned to the right of selected items */}
            {isSearchable && (
              <input
                ref={inputRef}
                type="text"
                className="select-input"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder=""
                onClick={(e) => e.stopPropagation()}
                style={{
                  caretColor: '#1976d2'
                }}
              />
            )}
          </div>
        ) : isMulti ? (
          // Multi-select with no values - show placeholder
          <div className="multi-value-container">
            <span className={`select-value placeholder ${inputValue || isOpen ? 'hidden' : ''}`}>
              {placeholder}
            </span>
            {isSearchable && (
              <input
                ref={inputRef}
                type="text"
                className="select-input"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder=""
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  padding: '12px 16px',
                  boxSizing: 'border-box',
                  opacity: 1,
                  pointerEvents: 'auto',
                  background: 'transparent',
                  caretColor: '#1976d2'
                }}
              />
            )}
          </div>
        ) : (
          <>
            {/* Single select: show value/placeholder text left-aligned */}
            <span className={`select-value ${!value ? 'placeholder' : ''} ${inputValue || isOpen ? 'hidden' : ''}`}>
              {getDisplayValue() || placeholder}
            </span>
            {/* Search input for single select - show placeholder when no value */}
            {isSearchable && (
              <input
                ref={inputRef}
                type="text"
                className={`select-input ${!isMulti ? 'single-select-input' : ''}`}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder=""
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  width: '100%', 
                  height: '100%', 
                  padding: '12px 16px', 
                  boxSizing: 'border-box', 
                  opacity: 1, 
                  pointerEvents: 'auto',
                  caretColor: '#1976d2'
                }} 
              />
            )}
          </>
        )}
        
        <span className="select-arrow">
          {isOpen ? <IoIosArrowUp size={16} /> : <IoIosArrowDown size={16} />}
        </span>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          {isLoading ? (
            <div className="select-loading">
              <Loading size={16} />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="select-no-options">
              {searchQuery ? `No results for "${searchQuery}"` : noOptionsMessage}
            </div>
          ) : (
            <>
              <div className="select-options">
                {filteredOptions.map((option, index) => {
                  const optionLabel = getOptionLabel(option);
                  const optionValue = getOptionValue(option);
                  const matchValues = (a, b) => {
                        if (typeof a === 'string' && typeof b === 'string') return a === b;
                        if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) return (a.value || a.label) === (b.value || b.label);
                        if (typeof a === 'string' && typeof b === 'object' && b !== null) return a === b.value || a === b.label;
                        if (typeof a === 'object' && a !== null && typeof b === 'string') return a.value === b || a.label === b;
                        return false;
                      };
                  const isSelected = isMulti
                    ? Array.isArray(value) && value.some(v => matchValues(v, option))
                    : matchValues(value, option);
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={index}
                      className={`select-option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                      onClick={() => handleOptionSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <span className="option-label">{optionLabel}</span>
                      {isSelected && (
                        <span className="option-check">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


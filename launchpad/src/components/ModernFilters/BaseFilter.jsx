import React, { useState, useRef, useEffect } from 'react';
import { BiSearch, BiTrash, BiX } from 'react-icons/bi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import './BaseFilter.css';

const BaseFilter = ({ 
  config, 
  value, 
  onChange, 
  onClear, 
  disabled = false,
  className = '',
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filterRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isActive = value && !value.toString().startsWith('any_');
  const hasValue = value && value !== '';

  return (
    <div 
      ref={filterRef}
      className={`modern-filter ${className} ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {/* Filter Header */}
      <div 
        className="filter-header"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="filter-content">
          <span className="filter-label">{config.label}</span>
          {hasValue && (
            <span className="filter-value">
              {Array.isArray(value) ? `${value.length} selected` : value}
            </span>
          )}
        </div>
        
        <div className="filter-actions">
          {hasValue && onClear && (
            <button
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear filter"
              title="Clear filter"
            >
              <BiX size={16} />
            </button>
          )}
          <RiArrowDropDownLine 
            size={20} 
            className={`dropdown-icon ${isOpen ? 'open' : ''}`}
          />
        </div>
      </div>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="filter-dropdown">
          {/* Search Bar (if searchable) */}
          {config.searchable && (
            <div className="filter-search">
              <BiSearch size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
              />
              {searchQuery && (
                <button 
                  className="clear-search-button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <BiX size={16} />
                </button>
              )}
            </div>
          )}

          {/* Filter Content */}
          <div className="filter-content-wrapper">
            {children}
          </div>

          {/* Filter Actions */}
          {config.actions && (
            <div className="filter-actions-footer">
              {config.actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseFilter;

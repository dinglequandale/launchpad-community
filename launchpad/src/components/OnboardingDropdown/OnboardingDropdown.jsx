import React from 'react';
import Select from 'react-select';

export default function OnboardingDropdown({ question, options, selectedOption, onChange, type, onSearchQueryChange }) {
    const handleChange = (selectedOptions) => {
        const value = type === 'multi-select'
            ? selectedOptions.map(option => option.value)
            : selectedOptions.value;
        onChange(value);
    };

    const handleInputChange = (inputValue) => {
        if (onSearchQueryChange) {
            onSearchQueryChange(inputValue);
        }
    };

    // Use if passing solely an array of options instead of an array of value, label pairs
    // const formattedOptions = options.map(option => ({ value: option, label: option }));

    return (
        <div className="form-group">
            <label>{question}</label>
            {type === 'multi-select' ? (
                <Select
                    isMulti
                    value={options.filter(option => selectedOption.includes(option.value))}
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    options={options}
                />
            ) : (
                <Select
                    value={options.find(option => option.value === selectedOption)}
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    options={options}
                />
            )}
        </div>
    );
}

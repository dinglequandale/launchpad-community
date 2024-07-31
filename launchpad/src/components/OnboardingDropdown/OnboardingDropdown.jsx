import React from 'react';
import Select from 'react-select';
import "./onboardingdropdown.css";

export default function OnboardingDropdown({ question, options, selectedOption, onChange, type, onSearchQueryChange, showQuestion=true }) {
    const handleChange = (selectedOptions) => {
        const label = type === 'multi-select'
            ? selectedOptions.map(option => option.label)
            : selectedOptions.label;
        onChange(label);
    };

    const handleInputChange = (inputValue) => {
        if (onSearchQueryChange) {
            onSearchQueryChange(inputValue);
        }
    };

    // Use if passing solely an array of options instead of an array of value, label pairs
    // const formattedOptions = options.map(option => ({ value: option, label: option }));

    return (
        <div className="dropDownContainer">
            {showQuestion && <label>{question}</label>}
            {type === 'multi-select' ? (
                <Select
                    isMulti
                    value={selectedOption ? selectedOption.map(option => ({ value: option, label: option })) : null}
                    // value={options.filter(option => selectedOption.includes(option.label))}
                    // value={selectedOption}
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    options={options}
                />
            ) : (
                <Select
                    // value={options.find(option => option.label === selectedOption)}
                    value={selectedOption ? { value: selectedOption, label: selectedOption } : null}
                    onChange={handleChange}
                    onInputChange={handleInputChange}
                    options={options}
                />
            )}
        </div>
    );
}

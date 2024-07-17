import React from 'react';
import Select from 'react-select';

export default function OnboardingDropdown({ question, options, selectedOption, onChange, type }) {
    const handleChange = (selectedOptions) => {
        const value = type === 'multi-select'
            ? selectedOptions.map(option => option.value)
            : selectedOptions.value;
        onChange(value);
    };

    const formattedOptions = options.map(option => ({ value: option, label: option }));

    return (
        <div className="form-group">
            <label>{question}</label>
            {type === 'multi-select' ? (
                <Select
                    isMulti
                    value={formattedOptions.filter(option => selectedOption.includes(option.value))}
                    onChange={handleChange}
                    options={formattedOptions}
                />
            ) : (
                <Select
                    value={formattedOptions.find(option => option.value === selectedOption)}
                    onChange={handleChange}
                    options={formattedOptions}
                />
            )}
        </div>
    );
}

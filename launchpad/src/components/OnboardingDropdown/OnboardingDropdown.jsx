import React from 'react';
import CustomSelect from '../CustomSelect';
import "./OnboardingDropdown.css";

export default function OnboardingDropdown({ question, options, selectedOption, onChange, type, onSearchQueryChange, showQuestion=true, placeholder=null, isLoading=false, loadingMessage="" }) {
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

    const getValue = () => {
        if (!selectedOption) return null;
        
        if (type === 'multi-select') {
          // Ensure selectedOption is always treated as an array
          const optionArray = Array.isArray(selectedOption) ? selectedOption : [selectedOption];
          return optionArray.map(option => ({ value: option, label: option }));
        } else {
          return { value: selectedOption, label: selectedOption };
        }
    };
    
    // const filteredOptions = getValue() ? options.filter(option => 
    //     // Filter out options that are already selected
    //     ![...getValue()].some(selectedOption => selectedOption.value === option.value)
    //   ) : null;
    // alert(filteredOptions);

    return (
        <div className="dropDownContainer">
            {showQuestion && <label>{typeof question === 'string' ? question : question?.text || ''}</label>}
            <CustomSelect
                options={options}
                value={type === 'multi-select' ? selectedOption : selectedOption}
                onChange={onChange}
                placeholder={placeholder ?? "Type..."}
                isMulti={type === 'multi-select'}
                isSearchable={true}
                onSearchQueryChange={handleInputChange}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                noOptionsMessage="No options available"
            />
        </div>
    );
}

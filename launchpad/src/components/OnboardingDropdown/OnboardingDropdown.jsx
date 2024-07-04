import React, { useState, useEffect } from 'react';

export default function OnboardingDropdown({ question, options, selectedOption, onChange }) {
    // Set the initial value of the selected option
    const [internalSelectedOption, setInternalSelectedOption] = useState(selectedOption || '');

    // Handle changes to the dropdown selection
    const handleChange = (event) => {
        const value = event.target.value;
        setInternalSelectedOption(value);
        onChange(value); // Notify the parent component of the change
    };

    // Update internal state when the parent component's value changes
    useEffect(() => {
        setInternalSelectedOption(selectedOption);
    }, [selectedOption]);

    return (
        <div>
            <label htmlFor="dropdown">{question}</label>
            <select id="dropdown" value={internalSelectedOption} onChange={handleChange}>
                <option value="" disabled>Select an option</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {internalSelectedOption && <p>You selected: {internalSelectedOption}</p>}
        </div>
    );
}

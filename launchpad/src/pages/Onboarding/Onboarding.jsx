import React, { useState } from 'react';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import CollegeStudent from './CollegeStudent/CollegeStudent';
import HighSchooler from './HighSchooler/HighSchooler';
import Professional from './Professional/Professional';

export default function Onboarding() {
    const [selectedOption, setSelectedOption] = useState('');
    const [showComponent, setShowComponent] = useState(false);

    const handleDropdownChange = (value) => {
        setSelectedOption(value);
    };

    const handleContinue = () => {
        setShowComponent(true);
    };

    return (
        <div>
            {!showComponent ? (
                <>
                    <OnboardingDropdown
                        question="Are you a current high schooler, alumni, or a professional?"
                        options={["High School", "College Student and Alumni", "Professional"].map(option => ({ value: option, label: option }))}
                        selectedOption={selectedOption}
                        onChange={handleDropdownChange}
                    />
                    <button className="continueButton" onClick={handleContinue} disabled={!selectedOption}>
                        Continue
                    </button>
                </>
            ) : (
                <>
                    {selectedOption === "High School" && <HighSchooler />}
                    {selectedOption === "College Student and Alumni" && <CollegeStudent />}
                    {selectedOption === "Professional" && <Professional />}
                </>
            )}
        </div>
    );
};
import React, { useState } from 'react';
import CustomSelect from './CustomSelect';
import './CustomSelect.css';

export default function CustomSelectTest() {
  const [singleValue, setSingleValue] = useState('');
  const [multiValue, setMultiValue] = useState([]);
  const [searchableValue, setSearchableValue] = useState('');

  const simpleOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' }
  ];

  const collegeOptions = [
    { value: 'harvard', label: 'Harvard University' },
    { value: 'stanford', label: 'Stanford University' },
    { value: 'mit', label: 'MIT' },
    { value: 'yale', label: 'Yale University' },
    { value: 'princeton', label: 'Princeton University' }
  ];

  console.log('Test component render:', {
    singleValue,
    multiValue,
    searchableValue
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>CustomSelect Component Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Single Select</h3>
        <CustomSelect
          options={simpleOptions}
          value={singleValue}
          onChange={(value) => {
            console.log('Single select changed:', value);
            setSingleValue(value);
          }}
          placeholder="Choose an option..."
          isMulti={false}
          isSearchable={false}
        />
        <p>Selected: {singleValue}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Multi Select (College Interests)</h3>
        <CustomSelect
          options={collegeOptions}
          value={multiValue}
          onChange={(value) => {
            console.log('Multi select changed:', value);
            setMultiValue(value);
          }}
          placeholder="Select college interests..."
          isMulti={true}
          isSearchable={false}
        />
        <p>Selected: {JSON.stringify(multiValue)}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Searchable Select</h3>
        <CustomSelect
          options={collegeOptions}
          value={searchableValue}
          onChange={(value) => {
            console.log('Searchable select changed:', value);
            setSearchableValue(value);
          }}
          placeholder="Search and select..."
          isMulti={false}
          isSearchable={true}
        />
        <p>Selected: {searchableValue}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Debug Info</h3>
        <pre>
          {JSON.stringify({
            singleValue,
            multiValue,
            searchableValue,
            singleValueType: typeof singleValue,
            multiValueType: typeof multiValue,
            multiValueIsArray: Array.isArray(multiValue)
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}



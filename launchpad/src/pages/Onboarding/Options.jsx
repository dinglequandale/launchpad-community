import { db } from '../../firebase/firebaseConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from 'firebase/firestore';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../components/CustomSelect';
import { algoliaClient } from '../../typesense/typesenseClient';
// import {algoliasearch} from 'algoliasearch/lite';
import Loading from '../../components/LoadingAnimation/Loading';

const highSchools = [
    { "value": "awty_international", "label": "Awty International School" },
    { "value": "bellaire_high", "label": "Bellaire High School" },
    { "value": "lamar_high", "label": "Lamar High School" },
    { "value": "john_cooper", "label": "John Cooper School" },
    { "value": "carnegie_vanguard", "label": "Carnegie Vanguard High School" },
    { "value": "debakey_high", "label": "DeBakey High School for Health Professions" },
    { "value": "westside_high", "label": "Westside High School" },
    { "value": "heights_high", "label": "Heights High School" },
    { "value": "kinder_high", "label": "Kinder High School for the Performing and Visual Arts" },
    { "value": "yates_high", "label": "Yates High School" },
    { "value": "strake_jesuit", "label": "Strake Jesuit College Preparatory" },
    { "value": "st_agnes", "label": "St. Agnes Academy" },
    { "value": "st_thomas", "label": "St. Thomas High School" },
    { "value": "episcopal_high", "label": "Episcopal High School" },
    { "value": "kinkaid_school", "label": "The Kinkaid School" },
    { "value": "second_baptist", "label": "Second Baptist School" },
    { "value": "emery_weiner", "label": "The Emery/Weiner School" },
    { "value": "st_johns", "label": "St. John's School" },
    { "value": "incarnate_word", "label": "Incarnate Word Academy" },
    { "value": "houston_christian", "label": "Houston Christian High School" },
    { "value": "lutheran_high_north", "label": "Lutheran High North" },
    { "value": "westbury_christian", "label": "Westbury Christian School" },
    { "value": "houston_academy", "label": "Houston Academy for International Studies" },
    { "value": "challenge_early", "label": "Challenge Early College High School" },
    { "value": "east_early", "label": "East Early College High School" },
    { "value": "north_houston_early", "label": "North Houston Early College High School" },
    { "value": "sharpstown_international", "label": "Sharpstown International School" },
    { "value": "young_womens", "label": "Young Women's College Preparatory Academy" },
    { "value": "energized_innovative", "label": "Energized for STEM Academy" },
    { "value": "mickey_leland", "label": "Mickey Leland College Preparatory Academy" },
    { "value": "harmony_school_excellence", "label": "Harmony School of Excellence" },
    { "value": "yes_prep_north_central", "label": "YES Prep North Central" },
    { "value": "kipp_houston", "label": "KIPP Houston High School" },
    { "value": "spring_woods", "label": "Spring Woods High School" },
    { "value": "stratford", "label": "Stratford High School" },
    { "value": "memorial", "label": "Memorial High School" }
];

const careerInterests = [
  {"value": "aerospace", "label": "Aerospace", "group": "STEM"},
  {"value": "anthropology", "label": "Anthropology", "group": "Social Sciences"},
  {"value": "architecture", "label": "Architecture", "group": "Design & Architecture"},
  {"value": "artificial_intelligence", "label": "Artificial Intelligence", "group": "STEM"},
  {"value": "astronomy", "label": "Astronomy", "group": "STEM"},
  {"value": "athletics_fitness", "label": "Athletics & Fitness", "group": "Health & Wellness"},
  {"value": "aviation", "label": "Aviation", "group": "Hands-On Trades"},
  {"value": "biology", "label": "Biology", "group": "Life Sciences"},
  {"value": "biomedical_engineering", "label": "Biomedical Engineering", "group": "STEM"},
  {"value": "building_trades", "label": "Hands-On Building Trades (Carpentry, Welding, Plumbing, and Construction)", "group": "Hands-On Trades"},
  {"value": "business", "label": "Business Management", "group": "Business"},
  {"value": "business_consulting", "label": "Business Consulting", "group": "Business"},
  {"value": "chemistry", "label": "Chemistry", "group": "STEM"},
  {"value": "chemical_engineering", "label": "Chemical Engineering", "group": "STEM"},
  {"value": "civil_engineering", "label": "Civil Engineering", "group": "STEM"},
  {"value": "communications", "label": "Communications Study", "group": "Arts & Humanities"},
  {"value": "computer_science", "label": "Computer Science", "group": "STEM"},
  {"value": "computer_engineering", "label": "Computer Engineering", "group": "STEM"},
  {"value": "creative_writing", "label": "Creative Writing", "group": "Arts & Humanities"},
  {"value": "criminal_justice", "label": "Criminal Justice", "group": "Legal"},
  {"value": "culinary_arts", "label": "Culinary Arts", "group": "Arts & Humanities"},
  {"value": "data_science", "label": "Data Science & Analysis", "group": "STEM"},
  {"value": "design", "label": "Design", "group": "Design & Architecture"},
  {"value": "economics", "label": "Economics", "group": "Social Sciences"},
  {"value": "education", "label": "Education (Teaching, Administration, Counseling)", "group": "Education"},
  {"value": "electrical_engineering", "label": "Electrical Engineering", "group": "STEM"},
  {"value": "engineering", "label": "Engineering (General)", "group": "STEM"},
  {"value": "entrepreneurship", "label": "Entrepreneurship", "group": "Business"},
  {"value": "entertainment", "label": "Entertainment", "group": "Business"},
  {"value": "environmental_science", "label": "Environmental Science", "group": "Life Sciences"},
  {"value": "environmental_engineering", "label": "Environmental Engineering", "group": "STEM"},
  {"value": "fashion", "label": "Fashion", "group": "Arts & Humanities"},
  {"value": "film_studies", "label": "Film Studies", "group": "Arts & Humanities"},
  {"value": "finance", "label": "Finance", "group": "Business"},
  {"value": "forestry", "label": "Forestry", "group": "Life Sciences"},
  {"value": "gender_studies", "label": "Gender Studies", "group": "Social Sciences"},
  {"value": "geography", "label": "Geography", "group": "Social Sciences"},
  {"value": "geology", "label": "Geology", "group": "Life Sciences"},
  {"value": "health_science", "label": "Health Science", "group": "Medical"},
  {"value": "history", "label": "History", "group": "Arts & Humanities"},
  {"value": "hospitality_management", "label": "Hospitality Management", "group": "Business"},
  {"value": "human_resources", "label": "Human Resources", "group": "Business"},
  {"value": "human_rights", "label": "Human Rights", "group": "Social Sciences"},
  {"value": "information_technology", "label": "Information Technology", "group": "STEM"},
  {"value": "industrial_engineering", "label": "Industrial Engineering", "group": "STEM"},
  {"value": "international_relations", "label": "International Relations", "group": "Social Sciences"},
  {"value": "journalism", "label": "Journalism & Writing", "group": "Arts & Humanities"},
  {"value": "law", "label": "Law", "group": "Legal"},
  {"value": "life_science", "label": "Life, Animal, & Earth Science", "group": "Life Sciences"},
  {"value": "linguistics", "label": "Linguistics", "group": "Arts & Humanities"},
  {"value": "literature", "label": "Literature", "group": "Arts & Humanities"},
  {"value": "maintenance_event", "label": "Hands-On Maintenance & Event Organization", "group": "Hands-On Trades"},
  {"value": "marine_science", "label": "Marine Science", "group": "Life Sciences"},
  {"value": "marketing", "label": "Marketing & Advertising", "group": "Business"},
  {"value": "mathematics", "label": "Mathematics", "group": "STEM"},
  {"value": "mechanical_trades", "label": "Hands-On Mechanical & Technical Trades", "group": "Hands-On Trades"},
  {"value": "mechanical_engineering", "label": "Mechanical Engineering", "group": "STEM"},
  {"value": "medicine_general", "label": "Medicine", "group": "Medical"},
  {"value": "military", "label": "Military", "group": "Public Service"},
  {"value": "music", "label": "Music", "group": "Arts & Humanities"},
  {"value": "music_business", "label": "Music Business", "group": "Business"},
  {"value": "performing_arts", "label": "Performing Arts", "group": "Arts & Humanities"},
  {"value": "philosophy", "label": "Philosophy", "group": "Arts & Humanities"},
  {"value": "physics", "label": "Physics", "group": "STEM"},
  {"value": "political_science", "label": "Political Science", "group": "Social Sciences"},
  {"value": "psychology", "label": "Psychology", "group": "Social Sciences"},
  {"value": "public_policy", "label": "Public & Government Policy Administration / Politics", "group": "Social Sciences"},
  {"value": "real_estate", "label": "Real Estate", "group": "Business"},
  {"value": "social_work", "label": "Social Work (Social Services, Counseling)", "group": "Social Sciences"},
  {"value": "sociology", "label": "Sociology", "group": "Social Sciences"},
  {"value": "software_engineering", "label": "Software Engineering", "group": "STEM"},
  {"value": "theater", "label": "Theater & Movies", "group": "Arts & Humanities"},
  {"value": "visual_arts", "label": "Visual Arts", "group": "Arts & Humanities"}
]

const client = algoliaClient;

const graduationYears = [];
for (let year = 2030; year >= 1990; year--) {
    graduationYears.push({ value: year, label: year.toString() });
}

// Refactored getColleges to be a regular async function instead of a hook
const getColleges = async (searchQuery = '') => {
  if (searchQuery.length < 1) {
    // Return some popular colleges as default results when no search query
    try {
      const {results} = await client.search({
        requests: [{ indexName: 'colleges', query: '', hitsPerPage: 5 }],
      });
      const hits = results[0].hits;
      const colleges = hits.map(hit => ({
        label: hit.label,
        value: hit.value || hit.objectID, // Fallback to Algolia's ID
      }));
      
      // If no results from empty search, try with a common term to get some colleges
      if (colleges.length === 0) {
        const fallbackResults = await client.search({
          requests: [{ indexName: 'colleges', query: 'university', hitsPerPage: 5 }],
        });
        const fallbackHits = fallbackResults.results[0].hits;
        const fallbackColleges = fallbackHits.map(hit => ({
          label: hit.label,
          value: hit.value || hit.objectID,
        }));
        return { colleges: fallbackColleges, loading: false };
      }
      
      return { colleges, loading: false };
    } catch (error) {
      console.error('Algolia search error:', error);
      // Fallback to empty array if search fails
      return { colleges: [], loading: false };
    }
  }

  try {
    const {results} = await client.search({
      requests: [{ indexName: 'colleges', query: searchQuery, hitsPerPage: 5 }],
    });
    const hits = results[0].hits;
    const colleges = hits.map(hit => ({
      label: hit.label,
      value: hit.value || hit.objectID, // Fallback to Algolia's ID
    }));
    return { colleges, loading: false };
  } catch (error) {
    console.error('Algolia search error:', error);
    return { colleges: [], loading: false };
  }
};

const CollegeSearch = ({ selectedOptions, handleChange, isMultiSelect = false, showQuestion = true, field = "collegeInterestsOrDecision" }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Load default colleges when component mounts
  useEffect(() => {
    const loadDefaultColleges = async () => {
      setLoading(true);
      const { colleges } = await getColleges('');
      setOptions(colleges);
      setLoading(false);
    };
    
    loadDefaultColleges();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (inputValue.length < 1) {
      // When input is cleared, show default colleges again
      const loadDefaultColleges = async () => {
        setLoading(true);
        const { colleges } = await getColleges('');
        setOptions(colleges);
        setLoading(false);
      };
      
      loadDefaultColleges();
      return;
    }

    setLoading(true);
    const searchColleges = async () => {
      const { colleges } = await getColleges(inputValue);
      setOptions(colleges);
      setLoading(false);
    };

    const debouncedSearch = setTimeout(searchColleges, 300);
    return () => clearTimeout(debouncedSearch);
  }, [inputValue]);

  const handleInputChange = (inputValue) => {
    setInputValue(inputValue);
  };

  // Create a wrapper function that knows which field to update
  const handleCollegeChange = (selectedOption) => {
    const fieldId = field;
    
    if (isMultiSelect) {
      // For multi-select (collegeInterestsOrDecision), store as array of strings
      const value = selectedOption ? selectedOption.map(college => 
        typeof college === 'string' ? college : college.label || college.value
      ) : [];
      handleChange(fieldId, value);
    } else {
      // For single select (collegeAttending), store as string
      const value = selectedOption ? 
        (typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.value) 
        : '';
      handleChange(fieldId, value);
    }
  };

  // Get the current value for display
  const getCurrentValue = () => {
    // Add safety check for selectedOptions
    if (!selectedOptions) return isMultiSelect ? [] : '';
    const currentValue = selectedOptions[field];
    
    if (isMultiSelect) {
      // For multi-select (collegeInterestsOrDecision), currentValue should be an array
      if (Array.isArray(currentValue)) {
        // Convert string array to object array format
        return currentValue.map(college => 
          typeof college === 'string' 
            ? { label: college, value: college }
            : college
        );
      } else {
        return [];
      }
    } else {
      // For single select (collegeAttending), currentValue should be a string
      return currentValue ? { label: currentValue, value: currentValue } : '';
    }
  };

  return (
    <CustomSelect
      options={options}
      value={getCurrentValue()}
      onChange={handleCollegeChange}
      placeholder="Start typing college name..."
      isMulti={isMultiSelect}
      isSearchable={true}
      onSearchQueryChange={handleInputChange}
      isLoading={loading}
      loadingMessage="Searching colleges..."
      noOptionsMessage={inputValue ? `No colleges found for "${inputValue}"` : "No colleges available"}
    />
  );
};


export { highSchools, careerInterests, graduationYears, getColleges, CollegeSearch };
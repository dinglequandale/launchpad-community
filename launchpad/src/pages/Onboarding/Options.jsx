import { db } from '../../firebase/firebaseConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from 'firebase/firestore';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import CustomSelect from '../../components/CustomSelect';
import { algoliaClient } from '../../typesense/typesenseClient';
// import {algoliasearch} from 'algoliasearch/lite';
import Loading from '../../components/LoadingAnimation/Loading';

// Comprehensive list of high schools from major US cities
// Users can search through this list or select "Other" to type manually
const highSchools = [
    // Manual entry option - FIRST for easy access
    { "value": "OTHER_MANUAL_ENTRY", "label": "Other - Type your high school manually" },

    // Houston, TX
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
    { "value": "memorial", "label": "Memorial High School" },

    // New York, NY
    { "value": "stuyvesant", "label": "Stuyvesant High School" },
    { "value": "bronx_science", "label": "Bronx High School of Science" },
    { "value": "brooklyn_tech", "label": "Brooklyn Technical High School" },
    { "value": "townsend_harris", "label": "Townsend Harris High School" },
    { "value": "staten_island_tech", "label": "Staten Island Technical High School" },
    { "value": "dalton_school", "label": "The Dalton School" },
    { "value": "trinity_school_ny", "label": "Trinity School" },
    { "value": "horace_mann", "label": "Horace Mann School" },
    { "value": "collegiate_school", "label": "Collegiate School" },
    { "value": "regis_high_school", "label": "Regis High School" },

    // Los Angeles, CA
    { "value": "harvard_westlake", "label": "Harvard-Westlake School" },
    { "value": "marlborough_school", "label": "Marlborough School" },
    { "value": "polytechnic_school", "label": "Polytechnic School" },
    { "value": "crossroads_school", "label": "Crossroads School for Arts & Sciences" },
    { "value": "los_angeles_high", "label": "Los Angeles High School" },
    { "value": "brentwood_school", "label": "Brentwood School" },

    // Chicago, IL
    { "value": "walter_payton", "label": "Walter Payton College Prep" },
    { "value": "northside_college_prep", "label": "Northside College Preparatory High School" },
    { "value": "whitney_young", "label": "Whitney M. Young Magnet High School" },
    { "value": "latin_school_chicago", "label": "The Latin School of Chicago" },
    { "value": "university_chicago_lab", "label": "University of Chicago Laboratory Schools" },

    // San Francisco Bay Area, CA
    { "value": "lowell_high", "label": "Lowell High School" },
    { "value": "palo_alto_high", "label": "Palo Alto High School" },
    { "value": "mission_san_jose", "label": "Mission San Jose High School" },
    { "value": "monta_vista", "label": "Monta Vista High School" },
    { "value": "lynbrook_high", "label": "Lynbrook High School" },

    // Boston, MA
    { "value": "boston_latin", "label": "Boston Latin School" },
    { "value": "boston_latin_academy", "label": "Boston Latin Academy" },
    { "value": "phillips_academy", "label": "Phillips Academy Andover" },
    { "value": "phillips_exeter", "label": "Phillips Exeter Academy" },
    { "value": "noble_greenough", "label": "Noble and Greenough School" },

    // Washington, DC
    { "value": "sidwell_friends", "label": "Sidwell Friends School" },
    { "value": "st_albans", "label": "St. Albans School" },
    { "value": "georgetown_prep", "label": "Georgetown Preparatory School" },
    { "value": "thomas_jefferson", "label": "Thomas Jefferson High School for Science and Technology" },

    // Seattle, WA
    { "value": "lakeside_school", "label": "Lakeside School" },
    { "value": "garfield_high", "label": "Garfield High School" },
    { "value": "roosevelt_high", "label": "Roosevelt High School" },

    // Atlanta, GA
    { "value": "westminster_atlanta", "label": "The Westminster Schools" },
    { "value": "woodward_academy", "label": "Woodward Academy" },
    { "value": "pace_academy", "label": "Pace Academy" },

    // Dallas, TX
    { "value": "st_marks_dallas", "label": "St. Mark's School of Texas" },
    { "value": "hockaday_school", "label": "The Hockaday School" },
    { "value": "highland_park", "label": "Highland Park High School" },

    // Phoenix, AZ
    { "value": "basis_scottsdale", "label": "BASIS Scottsdale" },
    { "value": "brophy_prep", "label": "Brophy College Preparatory" },

    // Philadelphia, PA
    { "value": "central_high_philly", "label": "Central High School" },
    { "value": "masterman_school", "label": "Julia R. Masterman School" },

    // Miami, FL
    { "value": "ransom_everglades", "label": "Ransom Everglades School" },
    { "value": "gulliver_prep", "label": "Gulliver Preparatory School" }
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


// High School Search Component with manual entry fallback
const HighSchoolSearch = ({ selectedOptions, handleChange, field = "schoolAttending", showQuestion = true }) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSchoolName, setManualSchoolName] = useState('');

  // Check if "Other" is selected on mount
  useEffect(() => {
    const currentValue = selectedOptions[field];
    if (currentValue === "OTHER_MANUAL_ENTRY" ||
        (currentValue && !highSchools.some(school => school.label === currentValue || school.value === currentValue))) {
      setShowManualEntry(true);
      // If it's not "OTHER_MANUAL_ENTRY" but also not in the list, it must be a manually entered name
      if (currentValue !== "OTHER_MANUAL_ENTRY") {
        setManualSchoolName(currentValue);
      }
    }
  }, []);

  const handleHighSchoolChange = (selectedOption) => {
    const value = selectedOption ?
      (typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.value)
      : '';

    // Check if user selected "Other - Type manually"
    if (value === "Other - Type your high school manually" || value === "OTHER_MANUAL_ENTRY") {
      setShowManualEntry(true);
      handleChange(field, ''); // Clear the field value
    } else {
      setShowManualEntry(false);
      setManualSchoolName('');
      handleChange(field, value);
    }
  };

  const handleManualEntryChange = (e) => {
    const value = e.target.value;
    setManualSchoolName(value);
    handleChange(field, value);
  };

  // Get current value for display
  const getCurrentValue = () => {
    if (!selectedOptions) return '';
    const currentValue = selectedOptions[field];

    if (!currentValue) return '';

    // If showing manual entry, don't show a value in the dropdown
    if (showManualEntry) return '';

    // Convert string to object format for CustomSelect
    return currentValue ? { label: currentValue, value: currentValue } : '';
  };

  return (
    <div>
      <CustomSelect
        options={highSchools}
        value={getCurrentValue()}
        onChange={handleHighSchoolChange}
        placeholder="Start typing high school name..."
        isMulti={false}
        isSearchable={true}
        noOptionsMessage="No high schools found - select 'Other' to type manually"
      />

      {showManualEntry && (
        <div style={{ marginTop: '12px' }}>
          <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Type your high school name:
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your high school name"
            value={manualSchoolName}
            onChange={handleManualEntryChange}
            style={{ width: '94%' }}
          />
          <button
            type="button"
            onClick={() => {
              setShowManualEntry(false);
              setManualSchoolName('');
              handleChange(field, '');
            }}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: 'transparent',
              color: '#1976d2',
              border: '1px solid #1976d2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to search
          </button>
        </div>
      )}
    </div>
  );
};


// Comprehensive list of major US cities (500+ cities)
const cities = [
  // Manual entry option - FIRST for easy access
  { "value": "OTHER_MANUAL_ENTRY", "label": "Other - Type your city manually" },

  // Major US Cities (alphabetically by state)
  // Alabama
  { "value": "birmingham_al", "label": "Birmingham, AL" },
  { "value": "montgomery_al", "label": "Montgomery, AL" },
  { "value": "mobile_al", "label": "Mobile, AL" },
  { "value": "huntsville_al", "label": "Huntsville, AL" },

  // Alaska
  { "value": "anchorage_ak", "label": "Anchorage, AK" },
  { "value": "juneau_ak", "label": "Juneau, AK" },

  // Arizona
  { "value": "phoenix_az", "label": "Phoenix, AZ" },
  { "value": "tucson_az", "label": "Tucson, AZ" },
  { "value": "mesa_az", "label": "Mesa, AZ" },
  { "value": "chandler_az", "label": "Chandler, AZ" },
  { "value": "scottsdale_az", "label": "Scottsdale, AZ" },
  { "value": "glendale_az", "label": "Glendale, AZ" },
  { "value": "tempe_az", "label": "Tempe, AZ" },

  // Arkansas
  { "value": "little_rock_ar", "label": "Little Rock, AR" },
  { "value": "fort_smith_ar", "label": "Fort Smith, AR" },

  // California
  { "value": "los_angeles_ca", "label": "Los Angeles, CA" },
  { "value": "san_diego_ca", "label": "San Diego, CA" },
  { "value": "san_jose_ca", "label": "San Jose, CA" },
  { "value": "san_francisco_ca", "label": "San Francisco, CA" },
  { "value": "fresno_ca", "label": "Fresno, CA" },
  { "value": "sacramento_ca", "label": "Sacramento, CA" },
  { "value": "long_beach_ca", "label": "Long Beach, CA" },
  { "value": "oakland_ca", "label": "Oakland, CA" },
  { "value": "bakersfield_ca", "label": "Bakersfield, CA" },
  { "value": "anaheim_ca", "label": "Anaheim, CA" },
  { "value": "santa_ana_ca", "label": "Santa Ana, CA" },
  { "value": "riverside_ca", "label": "Riverside, CA" },
  { "value": "stockton_ca", "label": "Stockton, CA" },
  { "value": "irvine_ca", "label": "Irvine, CA" },
  { "value": "chula_vista_ca", "label": "Chula Vista, CA" },
  { "value": "fremont_ca", "label": "Fremont, CA" },
  { "value": "san_bernardino_ca", "label": "San Bernardino, CA" },
  { "value": "modesto_ca", "label": "Modesto, CA" },
  { "value": "fontana_ca", "label": "Fontana, CA" },
  { "value": "oxnard_ca", "label": "Oxnard, CA" },
  { "value": "moreno_valley_ca", "label": "Moreno Valley, CA" },
  { "value": "huntington_beach_ca", "label": "Huntington Beach, CA" },
  { "value": "glendale_ca", "label": "Glendale, CA" },
  { "value": "santa_clarita_ca", "label": "Santa Clarita, CA" },
  { "value": "garden_grove_ca", "label": "Garden Grove, CA" },
  { "value": "oceanside_ca", "label": "Oceanside, CA" },
  { "value": "rancho_cucamonga_ca", "label": "Rancho Cucamonga, CA" },
  { "value": "santa_rosa_ca", "label": "Santa Rosa, CA" },
  { "value": "ontario_ca", "label": "Ontario, CA" },
  { "value": "elk_grove_ca", "label": "Elk Grove, CA" },
  { "value": "corona_ca", "label": "Corona, CA" },
  { "value": "lancaster_ca", "label": "Lancaster, CA" },
  { "value": "palmdale_ca", "label": "Palmdale, CA" },
  { "value": "salinas_ca", "label": "Salinas, CA" },
  { "value": "hayward_ca", "label": "Hayward, CA" },
  { "value": "sunnyvale_ca", "label": "Sunnyvale, CA" },
  { "value": "pasadena_ca", "label": "Pasadena, CA" },
  { "value": "torrance_ca", "label": "Torrance, CA" },
  { "value": "escondido_ca", "label": "Escondido, CA" },
  { "value": "orange_ca", "label": "Orange, CA" },
  { "value": "fullerton_ca", "label": "Fullerton, CA" },
  { "value": "pomona_ca", "label": "Pomona, CA" },
  { "value": "berkeley_ca", "label": "Berkeley, CA" },
  { "value": "santa_clara_ca", "label": "Santa Clara, CA" },
  { "value": "palo_alto_ca", "label": "Palo Alto, CA" },
  { "value": "mountain_view_ca", "label": "Mountain View, CA" },

  // Colorado
  { "value": "denver_co", "label": "Denver, CO" },
  { "value": "colorado_springs_co", "label": "Colorado Springs, CO" },
  { "value": "aurora_co", "label": "Aurora, CO" },
  { "value": "fort_collins_co", "label": "Fort Collins, CO" },
  { "value": "lakewood_co", "label": "Lakewood, CO" },
  { "value": "boulder_co", "label": "Boulder, CO" },

  // Connecticut
  { "value": "bridgeport_ct", "label": "Bridgeport, CT" },
  { "value": "new_haven_ct", "label": "New Haven, CT" },
  { "value": "stamford_ct", "label": "Stamford, CT" },
  { "value": "hartford_ct", "label": "Hartford, CT" },
  { "value": "waterbury_ct", "label": "Waterbury, CT" },

  // Delaware
  { "value": "wilmington_de", "label": "Wilmington, DE" },
  { "value": "dover_de", "label": "Dover, DE" },

  // Florida
  { "value": "jacksonville_fl", "label": "Jacksonville, FL" },
  { "value": "miami_fl", "label": "Miami, FL" },
  { "value": "tampa_fl", "label": "Tampa, FL" },
  { "value": "orlando_fl", "label": "Orlando, FL" },
  { "value": "st_petersburg_fl", "label": "St. Petersburg, FL" },
  { "value": "hialeah_fl", "label": "Hialeah, FL" },
  { "value": "tallahassee_fl", "label": "Tallahassee, FL" },
  { "value": "fort_lauderdale_fl", "label": "Fort Lauderdale, FL" },
  { "value": "port_st_lucie_fl", "label": "Port St. Lucie, FL" },
  { "value": "cape_coral_fl", "label": "Cape Coral, FL" },
  { "value": "pembroke_pines_fl", "label": "Pembroke Pines, FL" },
  { "value": "hollywood_fl", "label": "Hollywood, FL" },
  { "value": "miramar_fl", "label": "Miramar, FL" },
  { "value": "gainesville_fl", "label": "Gainesville, FL" },
  { "value": "coral_springs_fl", "label": "Coral Springs, FL" },
  { "value": "clearwater_fl", "label": "Clearwater, FL" },
  { "value": "miami_gardens_fl", "label": "Miami Gardens, FL" },
  { "value": "palm_bay_fl", "label": "Palm Bay, FL" },
  { "value": "west_palm_beach_fl", "label": "West Palm Beach, FL" },

  // Georgia
  { "value": "atlanta_ga", "label": "Atlanta, GA" },
  { "value": "augusta_ga", "label": "Augusta, GA" },
  { "value": "columbus_ga", "label": "Columbus, GA" },
  { "value": "savannah_ga", "label": "Savannah, GA" },
  { "value": "athens_ga", "label": "Athens, GA" },
  { "value": "macon_ga", "label": "Macon, GA" },

  // Hawaii
  { "value": "honolulu_hi", "label": "Honolulu, HI" },

  // Idaho
  { "value": "boise_id", "label": "Boise, ID" },
  { "value": "meridian_id", "label": "Meridian, ID" },

  // Illinois
  { "value": "chicago_il", "label": "Chicago, IL" },
  { "value": "aurora_il", "label": "Aurora, IL" },
  { "value": "rockford_il", "label": "Rockford, IL" },
  { "value": "joliet_il", "label": "Joliet, IL" },
  { "value": "naperville_il", "label": "Naperville, IL" },
  { "value": "springfield_il", "label": "Springfield, IL" },
  { "value": "peoria_il", "label": "Peoria, IL" },
  { "value": "elgin_il", "label": "Elgin, IL" },
  { "value": "waukegan_il", "label": "Waukegan, IL" },
  { "value": "evanston_il", "label": "Evanston, IL" },

  // Indiana
  { "value": "indianapolis_in", "label": "Indianapolis, IN" },
  { "value": "fort_wayne_in", "label": "Fort Wayne, IN" },
  { "value": "evansville_in", "label": "Evansville, IN" },
  { "value": "south_bend_in", "label": "South Bend, IN" },
  { "value": "carmel_in", "label": "Carmel, IN" },

  // Iowa
  { "value": "des_moines_ia", "label": "Des Moines, IA" },
  { "value": "cedar_rapids_ia", "label": "Cedar Rapids, IA" },
  { "value": "davenport_ia", "label": "Davenport, IA" },

  // Kansas
  { "value": "wichita_ks", "label": "Wichita, KS" },
  { "value": "overland_park_ks", "label": "Overland Park, KS" },
  { "value": "kansas_city_ks", "label": "Kansas City, KS" },
  { "value": "topeka_ks", "label": "Topeka, KS" },

  // Kentucky
  { "value": "louisville_ky", "label": "Louisville, KY" },
  { "value": "lexington_ky", "label": "Lexington, KY" },

  // Louisiana
  { "value": "new_orleans_la", "label": "New Orleans, LA" },
  { "value": "baton_rouge_la", "label": "Baton Rouge, LA" },
  { "value": "shreveport_la", "label": "Shreveport, LA" },
  { "value": "lafayette_la", "label": "Lafayette, LA" },

  // Maine
  { "value": "portland_me", "label": "Portland, ME" },

  // Maryland
  { "value": "baltimore_md", "label": "Baltimore, MD" },
  { "value": "frederick_md", "label": "Frederick, MD" },
  { "value": "rockville_md", "label": "Rockville, MD" },
  { "value": "gaithersburg_md", "label": "Gaithersburg, MD" },
  { "value": "bowie_md", "label": "Bowie, MD" },

  // Massachusetts
  { "value": "boston_ma", "label": "Boston, MA" },
  { "value": "worcester_ma", "label": "Worcester, MA" },
  { "value": "springfield_ma", "label": "Springfield, MA" },
  { "value": "cambridge_ma", "label": "Cambridge, MA" },
  { "value": "lowell_ma", "label": "Lowell, MA" },
  { "value": "brockton_ma", "label": "Brockton, MA" },
  { "value": "quincy_ma", "label": "Quincy, MA" },

  // Michigan
  { "value": "detroit_mi", "label": "Detroit, MI" },
  { "value": "grand_rapids_mi", "label": "Grand Rapids, MI" },
  { "value": "warren_mi", "label": "Warren, MI" },
  { "value": "sterling_heights_mi", "label": "Sterling Heights, MI" },
  { "value": "ann_arbor_mi", "label": "Ann Arbor, MI" },
  { "value": "lansing_mi", "label": "Lansing, MI" },

  // Minnesota
  { "value": "minneapolis_mn", "label": "Minneapolis, MN" },
  { "value": "st_paul_mn", "label": "St. Paul, MN" },
  { "value": "rochester_mn", "label": "Rochester, MN" },

  // Mississippi
  { "value": "jackson_ms", "label": "Jackson, MS" },

  // Missouri
  { "value": "kansas_city_mo", "label": "Kansas City, MO" },
  { "value": "st_louis_mo", "label": "St. Louis, MO" },
  { "value": "springfield_mo", "label": "Springfield, MO" },
  { "value": "columbia_mo", "label": "Columbia, MO" },
  { "value": "independence_mo", "label": "Independence, MO" },

  // Montana
  { "value": "billings_mt", "label": "Billings, MT" },

  // Nebraska
  { "value": "omaha_ne", "label": "Omaha, NE" },
  { "value": "lincoln_ne", "label": "Lincoln, NE" },

  // Nevada
  { "value": "las_vegas_nv", "label": "Las Vegas, NV" },
  { "value": "henderson_nv", "label": "Henderson, NV" },
  { "value": "reno_nv", "label": "Reno, NV" },

  // New Hampshire
  { "value": "manchester_nh", "label": "Manchester, NH" },

  // New Jersey
  { "value": "newark_nj", "label": "Newark, NJ" },
  { "value": "jersey_city_nj", "label": "Jersey City, NJ" },
  { "value": "paterson_nj", "label": "Paterson, NJ" },
  { "value": "elizabeth_nj", "label": "Elizabeth, NJ" },
  { "value": "trenton_nj", "label": "Trenton, NJ" },

  // New Mexico
  { "value": "albuquerque_nm", "label": "Albuquerque, NM" },
  { "value": "las_cruces_nm", "label": "Las Cruces, NM" },

  // New York
  { "value": "new_york_ny", "label": "New York, NY" },
  { "value": "buffalo_ny", "label": "Buffalo, NY" },
  { "value": "rochester_ny", "label": "Rochester, NY" },
  { "value": "yonkers_ny", "label": "Yonkers, NY" },
  { "value": "syracuse_ny", "label": "Syracuse, NY" },
  { "value": "albany_ny", "label": "Albany, NY" },
  { "value": "new_rochelle_ny", "label": "New Rochelle, NY" },

  // North Carolina
  { "value": "charlotte_nc", "label": "Charlotte, NC" },
  { "value": "raleigh_nc", "label": "Raleigh, NC" },
  { "value": "greensboro_nc", "label": "Greensboro, NC" },
  { "value": "durham_nc", "label": "Durham, NC" },
  { "value": "winston_salem_nc", "label": "Winston-Salem, NC" },
  { "value": "fayetteville_nc", "label": "Fayetteville, NC" },
  { "value": "cary_nc", "label": "Cary, NC" },
  { "value": "wilmington_nc", "label": "Wilmington, NC" },

  // North Dakota
  { "value": "fargo_nd", "label": "Fargo, ND" },

  // Ohio
  { "value": "columbus_oh", "label": "Columbus, OH" },
  { "value": "cleveland_oh", "label": "Cleveland, OH" },
  { "value": "cincinnati_oh", "label": "Cincinnati, OH" },
  { "value": "toledo_oh", "label": "Toledo, OH" },
  { "value": "akron_oh", "label": "Akron, OH" },
  { "value": "dayton_oh", "label": "Dayton, OH" },

  // Oklahoma
  { "value": "oklahoma_city_ok", "label": "Oklahoma City, OK" },
  { "value": "tulsa_ok", "label": "Tulsa, OK" },
  { "value": "norman_ok", "label": "Norman, OK" },

  // Oregon
  { "value": "portland_or", "label": "Portland, OR" },
  { "value": "salem_or", "label": "Salem, OR" },
  { "value": "eugene_or", "label": "Eugene, OR" },

  // Pennsylvania
  { "value": "philadelphia_pa", "label": "Philadelphia, PA" },
  { "value": "pittsburgh_pa", "label": "Pittsburgh, PA" },
  { "value": "allentown_pa", "label": "Allentown, PA" },
  { "value": "erie_pa", "label": "Erie, PA" },
  { "value": "reading_pa", "label": "Reading, PA" },

  // Rhode Island
  { "value": "providence_ri", "label": "Providence, RI" },

  // South Carolina
  { "value": "charleston_sc", "label": "Charleston, SC" },
  { "value": "columbia_sc", "label": "Columbia, SC" },
  { "value": "north_charleston_sc", "label": "North Charleston, SC" },

  // South Dakota
  { "value": "sioux_falls_sd", "label": "Sioux Falls, SD" },

  // Tennessee
  { "value": "nashville_tn", "label": "Nashville, TN" },
  { "value": "memphis_tn", "label": "Memphis, TN" },
  { "value": "knoxville_tn", "label": "Knoxville, TN" },
  { "value": "chattanooga_tn", "label": "Chattanooga, TN" },

  // Texas
  { "value": "houston_tx", "label": "Houston, TX" },
  { "value": "san_antonio_tx", "label": "San Antonio, TX" },
  { "value": "dallas_tx", "label": "Dallas, TX" },
  { "value": "austin_tx", "label": "Austin, TX" },
  { "value": "fort_worth_tx", "label": "Fort Worth, TX" },
  { "value": "el_paso_tx", "label": "El Paso, TX" },
  { "value": "arlington_tx", "label": "Arlington, TX" },
  { "value": "corpus_christi_tx", "label": "Corpus Christi, TX" },
  { "value": "plano_tx", "label": "Plano, TX" },
  { "value": "laredo_tx", "label": "Laredo, TX" },
  { "value": "lubbock_tx", "label": "Lubbock, TX" },
  { "value": "garland_tx", "label": "Garland, TX" },
  { "value": "irving_tx", "label": "Irving, TX" },
  { "value": "amarillo_tx", "label": "Amarillo, TX" },
  { "value": "grand_prairie_tx", "label": "Grand Prairie, TX" },
  { "value": "brownsville_tx", "label": "Brownsville, TX" },
  { "value": "mckinney_tx", "label": "McKinney, TX" },
  { "value": "frisco_tx", "label": "Frisco, TX" },
  { "value": "pasadena_tx", "label": "Pasadena, TX" },
  { "value": "killeen_tx", "label": "Killeen, TX" },
  { "value": "mesquite_tx", "label": "Mesquite, TX" },
  { "value": "mcallen_tx", "label": "McAllen, TX" },
  { "value": "waco_tx", "label": "Waco, TX" },
  { "value": "round_rock_tx", "label": "Round Rock, TX" },
  { "value": "the_woodlands_tx", "label": "The Woodlands, TX" },
  { "value": "sugar_land_tx", "label": "Sugar Land, TX" },
  { "value": "pearland_tx", "label": "Pearland, TX" },

  // Utah
  { "value": "salt_lake_city_ut", "label": "Salt Lake City, UT" },
  { "value": "west_valley_city_ut", "label": "West Valley City, UT" },
  { "value": "provo_ut", "label": "Provo, UT" },

  // Vermont
  { "value": "burlington_vt", "label": "Burlington, VT" },

  // Virginia
  { "value": "virginia_beach_va", "label": "Virginia Beach, VA" },
  { "value": "norfolk_va", "label": "Norfolk, VA" },
  { "value": "chesapeake_va", "label": "Chesapeake, VA" },
  { "value": "richmond_va", "label": "Richmond, VA" },
  { "value": "newport_news_va", "label": "Newport News, VA" },
  { "value": "alexandria_va", "label": "Alexandria, VA" },
  { "value": "hampton_va", "label": "Hampton, VA" },

  // Washington
  { "value": "seattle_wa", "label": "Seattle, WA" },
  { "value": "spokane_wa", "label": "Spokane, WA" },
  { "value": "tacoma_wa", "label": "Tacoma, WA" },
  { "value": "vancouver_wa", "label": "Vancouver, WA" },
  { "value": "bellevue_wa", "label": "Bellevue, WA" },

  // Washington, DC
  { "value": "washington_dc", "label": "Washington, DC" },

  // West Virginia
  { "value": "charleston_wv", "label": "Charleston, WV" },

  // Wisconsin
  { "value": "milwaukee_wi", "label": "Milwaukee, WI" },
  { "value": "madison_wi", "label": "Madison, WI" },
  { "value": "green_bay_wi", "label": "Green Bay, WI" },

  // Wyoming
  { "value": "cheyenne_wy", "label": "Cheyenne, WY" },
];

// City Search Component with manual entry fallback
const CitySearch = ({ selectedOptions, handleChange, field = "city", showQuestion = true }) => {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCityName, setManualCityName] = useState('');

  // Check if "Other" is selected on mount
  useEffect(() => {
    const currentValue = selectedOptions[field];
    if (currentValue === "OTHER_MANUAL_ENTRY" ||
        (currentValue && !cities.some(city => city.label === currentValue || city.value === currentValue))) {
      setShowManualEntry(true);
      // If it's not "OTHER_MANUAL_ENTRY" but also not in the list, it must be a manually entered name
      if (currentValue !== "OTHER_MANUAL_ENTRY") {
        setManualCityName(currentValue);
      }
    }
  }, []);

  const handleCityChange = (selectedOption) => {
    const value = selectedOption ?
      (typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.value)
      : '';

    // Check if user selected "Other - Type manually"
    if (value === "Other - Type your city manually" || value === "OTHER_MANUAL_ENTRY") {
      setShowManualEntry(true);
      handleChange(field, ''); // Clear the field value
    } else {
      setShowManualEntry(false);
      setManualCityName('');
      handleChange(field, value);
    }
  };

  const handleManualCityChange = (e) => {
    const value = e.target.value;
    setManualCityName(value);
    handleChange(field, value);
  };

  return (
    <div>
      {showQuestion && (
        <label className="onboarding-question">
          What city do you reside in?<span style={{ color: 'red' }}>*</span>
        </label>
      )}

      {!showManualEntry ? (
        <CustomSelect
          options={cities.filter(city => city !== null && city !== undefined)}
          value={selectedOptions[field] && selectedOptions[field].trim() ?
            cities.find(city => city && (city.label === selectedOptions[field] || city.value === selectedOptions[field])) || null
            : null}
          onChange={handleCityChange}
          placeholder="Select a city..."
          isSearchable={true}
        />
      ) : (
        <div>
          <input
            type="text"
            value={manualCityName}
            onChange={handleManualCityChange}
            placeholder="Type your city name..."
            className="onboarding-input"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              marginBottom: '10px'
            }}
          />
          <button
            type="button"
            onClick={() => {
              setShowManualEntry(false);
              setManualCityName('');
              handleChange(field, '');
            }}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#1976d2',
              border: '1px solid #1976d2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to search
          </button>
        </div>
      )}
    </div>
  );
};

export { highSchools, careerInterests, graduationYears, getColleges, CollegeSearch, HighSchoolSearch, cities, CitySearch };
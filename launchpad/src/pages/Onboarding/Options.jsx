import { db } from '../../firebase/firebaseConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, startAt, endAt, limit, getDocs } from 'firebase/firestore';
import OnboardingDropdown from '../../components/OnboardingDropdown/OnboardingDropdown';
import { client } from '../../typesense/typesenseClient'

const highSchools = [
    { "value": "awty_international", "label": "Awty International School" },
    { "value": "bellaire_high", "label": "Bellaire High School" },
    { "value": "lamar_high", "label": "Lamar High School" },
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
  // {"value": "business_management", "label": "Business (Management)", "group": "Business"},
  // {"value": "business_operations", "label": "Business (Operations)", "group": "Business"},
  // {"value": "business_sales", "label": "Business (Sales)", "group": "Business"},
  // {"value": "business_admin", "label": "Business (Administration)", "group": "Business"},
  {"value": "business", "label": "Business Management", "group": "Business"},
  {"value": "engineering", "label": "Engineering", "group": "STEM"},
  {"value": "computer_science", "label": "Computer Science", "group": "STEM"},
  {"value": "medicine_general", "label": "Medicine", "group": "Medical"},
  {"value": "finance", "label": "Finance", "group": "Business"},
  {"value": "economics", "label": "Economics", "group": "Social Sciences"},
  {"value": "law", "label": "Law", "group": "Legal"},
  {"value": "data_science", "label": "Data Science & Analysis", "group": "STEM"},
  {"value": "marketing", "label": "Marketing & Advertising", "group": "Business"},
  {"value": "biology", "label": "Biology", "group": "Life Sciences"},
  {"value": "environmental_science", "label": "Environmental Science", "group": "Life Sciences"},
  {"value": "artificial_intelligence", "label": "Artificial Intelligence", "group": "STEM"},
  {"value": "information_technology", "label": "Information Technology", "group": "STEM"},
  {"value": "physics", "label": "Physics", "group": "STEM"},
  {"value": "public_policy", "label": "Public & Government Policy Administration / Politics", "group": "Social Sciences"},
  {"value": "chemistry", "label": "Chemistry", "group": "STEM"},
  {"value": "political_science", "label": "Political Science", "group": "Social Sciences"},
  {"value": "athletics_fitness", "label": "Athletics & Fitness", "group": "Health & Wellness"},
  {"value": "architecture", "label": "Architecture", "group": "Design & Architecture"},
  {"value": "international_relations", "label": "International Relations", "group": "Social Sciences"},
  {"value": "psychology", "label": "Psychology", "group": "Social Sciences"},
  {"value": "health_science", "label": "Health Science", "group": "Medical"},
  {"value": "communications", "label": "Communications Study", "group": "Arts & Humanities"},
  {"value": "journalism", "label": "Journalism & Writing", "group": "Arts & Humanities"},
  {"value": "visual_arts", "label": "Visual Arts", "group": "Arts & Humanities"},
  {"value": "performing_arts", "label": "Performing Arts", "group": "Arts & Humanities"},
  {"value": "design", "label": "Design", "group": "Design & Architecture"},
  {"value": "mathematics", "label": "Mathematics", "group": "STEM"},
  {"value": "history", "label": "History", "group": "Arts & Humanities"},
  {"value": "sociology", "label": "Sociology", "group": "Social Sciences"},
  {"value": "astronomy", "label": "Astronomy", "group": "STEM"},
  {"value": "human_resources", "label": "Human Resources", "group": "Business"},
  {"value": "criminal_justice", "label": "Criminal Justice", "group": "Legal"},
  {"value": "aviation", "label": "Aviation", "group": "Hands-On Trades"}, 
  {"value": "music", "label": "Music", "group": "Arts & Humanities"},
  {"value": "culinary_arts", "label": "Culinary Arts", "group": "Arts & Humanities"},
  {"value": "film_studies", "label": "Film Studies", "group": "Arts & Humanities"},
  {"value": "geography", "label": "Geography", "group": "Social Sciences"},
  {"value": "human_rights", "label": "Human Rights", "group": "Social Sciences"},
  {"value": "marine_science", "label": "Marine Science", "group": "Life Sciences"},
  {"value": "anthropology", "label": "Anthropology", "group": "Social Sciences"},
  {"value": "philosophy", "label": "Philosophy", "group": "Arts & Humanities"},
  {"value": "gender_studies", "label": "Gender Studies", "group": "Social Sciences"},
  {"value": "hospitality_management", "label": "Hospitality Management", "group": "Business"},
  {"value": "geology", "label": "Geology", "group": "Life Sciences"},
  {"value": "life_science", "label": "Life, Animal, & Earth Science", "group": "Life Sciences"},
  {"value": "building_trades", "label": "Hands-On Building Trades (Carpentry, Welding, Plumbing, and Construction)", "group": "Hands-On Trades"},
  {"value": "mechanical_trades", "label": "Hands-On Mechanical & Technical Trades", "group": "Hands-On Trades"},
  {"value": "maintenance_event", "label": "Hands-On Maintenance & Event Organization", "group": "Hands-On Trades"},
  {"value": "military", "label": "Military", "group": "Public Service"}, 
  {"value": "fashion", "label": "Fashion", "group": "Arts & Humanities"},
  {"value": "forestry", "label": "Forestry", "group": "Life Sciences"}, 
  {"value": "linguistics", "label": "Linguistics", "group": "Arts & Humanities"},
  {"value": "linguistics", "label": "Literature", "group": "Arts & Humanities"},
  {"value": "theater", "label": "Theater & Movies", "group": "Arts & Humanities"},
  {"value": "education", "label": "Education (Teaching, Administration, Counseling)", "group": "Education"},
  {"value": "social_work", "label": "Social Work (Social Services, Counseling)", "group": "Social Sciences"} 
];

const graduationYears = [];
for (let year = 1990; year <= 2028; year++) {
    graduationYears.push({ value: year, label: year.toString() });
}

const getColleges = (searchQuery = null) => {
    const [colleges, setColleges] = useState([]);

  const fetchColleges = useCallback(async () => {
    if (searchQuery.length < 2) {
      setColleges([]);
      return;
    }

    const collegesRef = collection(db, "colleges");
    const q = query(
      collegesRef,
      orderBy('label'),
      startAt(searchQuery),
      endAt(searchQuery + '\uf8ff'),
      limit(5) // Limit the number of results
    );

    const querySnapshot = await getDocs(q);
    const collegeData = querySnapshot.docs.map(doc => ({
      label: doc.data().label,
      value: doc.data().value
    }));

    setColleges(collegeData);
  }, [searchQuery]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  return colleges;
};

const CollegeSearch = ({ question, selectedOption, onChange, type, showQuestion = true}) => {
  const [options, setOptions] = useState([]);

  const handleInputChange = async (inputValue) => {
    if (inputValue.length < 1) {
      setOptions([]); // Clear options if input is empty
      return;
    }

    const searchParameters = {
      q: inputValue,
      query_by: 'label',
      num_typos: 1, // Allow up to 1 typo
    };

    try {
      const searchResults = await client
        .collections('colleges')
        .documents()
        .search(searchParameters);

      const formattedOptions = searchResults.hits.map((hit) => ({
        value: hit.document.id,
        label: hit.document.label,
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error searching Typesense:', error);
    }
  };

  return (
    <OnboardingDropdown
      question={question}
      options={options}
      selectedOption={selectedOption}
      onChange={onChange}
      type={type} // Assuming single-select for college search
      onSearchQueryChange={handleInputChange} // Pass the input change handler
      showQuestion={showQuestion}
    />
  );
};


export { highSchools, careerInterests, graduationYears, getColleges, CollegeSearch };
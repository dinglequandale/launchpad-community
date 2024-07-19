import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, startAt, endAt, and } from 'firebase/firestore';
import { useState, useEffect } from 'react';

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
    {"value": "business_management", "label": "Business (Management)"},
    {"value": "business_operations", "label": "Business (Operations)"},
    {"value": "business_sales", "label": "Business (Sales)"},
    {"value": "business_admin", "label": "Business (Administration)"},
    {"value": "engineering", "label": "Engineering"},
    {"value": "computer_science", "label": "Computer Science"},
    {"value": "medicine_general", "label": "Medicine"},
    {"value": "finance", "label": "Finance"},
    {"value": "economics", "label": "Economics"},
    {"value": "law", "label": "Law"},
    {"value": "data_science", "label": "Data Science & Analysis"},
    {"value": "marketing", "label": "Marketing & Advertising"},
    {"value": "biology", "label": "Biology"},
    {"value": "environmental_science", "label": "Environmental Science"},
    {"value": "artificial_intelligence", "label": "Artificial Intelligence"},
    {"value": "information_technology", "label": "Information Technology"},
    {"value": "physics", "label": "Physics"},
    {"value": "public_policy", "label": "Public & Government Policy Administration / Politics"},
    {"value": "chemistry", "label": "Chemistry"},
    {"value": "political_science", "label": "Political Science"},
    {"value": "athletics_fitness", "label": "Athletics & Fitness"},
    {"value": "architecture", "label": "Architecture"},
    {"value": "international_relations", "label": "International Relations"},
    {"value": "psychology", "label": "Psychology"},
    {"value": "health_science", "label": "Health Science"},
    {"value": "communications", "label": "Communications Study"},
    {"value": "journalism", "label": "Journalism & Writing"},
    {"value": "visual_arts", "label": "Visual Arts"},
    {"value": "performing_arts", "label": "Performing Arts"},
    {"value": "design", "label": "Design"},
    {"value": "mathematics", "label": "Mathematics"},
    {"value": "history", "label": "History"},
    {"value": "sociology", "label": "Sociology"},
    {"value": "astronomy", "label": "Astronomy"},
    {"value": "human_resources", "label": "Human Resources"},
    {"value": "criminal_justice", "label": "Criminal Justice"},
    {"value": "aviation", "label": "Aviation"},
    {"value": "music", "label": "Music"},
    {"value": "culinary_arts", "label": "Culinary Arts"},
    {"value": "film_studies", "label": "Film Studies"},
    {"value": "geography", "label": "Geography"},
    {"value": "human_rights", "label": "Human Rights"},
    {"value": "marine_science", "label": "Marine Science"},
    {"value": "anthropology", "label": "Anthropology"},
    {"value": "philosophy", "label": "Philosophy"},
    {"value": "gender_studies", "label": "Gender Studies"},
    {"value": "hospitality_management", "label": "Hospitality Management"},
    {"value": "geology", "label": "Geology"},
    {"value": "life_science", "label": "Life, Animal, & Earth Science"}, 
    {"value": "building_trades", "label": "Hands-On Building Trades (Carpentry, Welding, Plumbing, and Construction)"},
    {"value": "mechanical_trades", "label": "Hands-On Mechanical & Technical Trades"},
    {"value": "maintenance_event", "label": "Hands-On Maintenance & Event Organization"},
    {"value": "military", "label": "Military"},
    {"value": "fashion", "label": "Fashion"},
    {"value": "forestry", "label": "Forestry"},
    {"value": "linguistics", "label": "Linguistics"},
    {"value": "theater", "label": "Theater & Movies"},
    {"value": "education", "label": "Education (Teaching, Administration, Counseling)"},
    {"value": "social_work", "label": "Social Work (Social Services, Counseling)"}
];

const graduationYears = [];
for (let year = 1990; year <= 2028; year++) {
    graduationYears.push({ value: year, label: year.toString() });
}

const getColleges = (searchQuery = '') => {
    const [colleges, setColleges] = useState([]);
  
    useEffect(() => {
      const fetchColleges = async () => {
        const collegeData = [];
        try {
          let q = query(collection(db, "colleges"), orderBy('label'));
          
          if (searchQuery) {
            q = query(
              collection(db, "colleges"),
              and(
                startAt(searchQuery),
                endAt(searchQuery + '~')
              )
            );
            console.log(searchQuery)
          } 
  
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            collegeData.push({ label: data.label, value: data.value });
          });
          setColleges(collegeData);
          console.log("Fetched colleges:", collegeData); // Debugging log
        } catch (error) {
          console.error("Error fetching colleges:", error);
        }
      };
  
      fetchColleges();
    }, [searchQuery]);
  
    return colleges;
  };

export { highSchools, careerInterests, graduationYears, getColleges };
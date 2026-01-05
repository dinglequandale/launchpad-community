import { db } from '../firebase/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * One-time script to seed the high_schools collection with initial data
 * Run this once to populate the database with the static high school list
 */

// Static high school list from Options.jsx (excluding the "Other" option)
const initialHighSchools = [
    // Houston, TX
    { "value": "awty_international", "label": "Awty International School" },
    { "value": "bellaire_high", "label": "Bellaire High School" },
    { "value": "carnegie_vanguard", "label": "Carnegie Vanguard High School" },
    { "value": "challenge_early_college", "label": "Challenge Early College High School" },
    { "value": "deBakey_high", "label": "DeBakey High School for Health Professions" },
    { "value": "eastwood_academy", "label": "Eastwood Academy" },
    { "value": "Episcopal_high_school", "label": "Episcopal High School" },
    { "value": "five_points", "label": "Five Points High School" },
    { "value": "fort_bend_dulles", "label": "Fort Bend Dulles High School" },
    { "value": "fort_bend_travis", "label": "Fort Bend Travis High School" },
    { "value": "heights_high", "label": "Heights High School" },
    { "value": "HSPVA", "label": "High School for the Performing and Visual Arts (HSPVA)" },
    { "value": "katy_seven_lakes", "label": "Katy Seven Lakes High School" },
    { "value": "katy_taylor", "label": "Katy Taylor High School" },
    { "value": "katy_tompkins", "label": "Katy Tompkins High School" },
    { "value": "kinkaid", "label": "Kinkaid School" },
    { "value": "lamar_high", "label": "Lamar High School" },
    { "value": "memorial_high", "label": "Memorial High School" },
    { "value": "paetow_high", "label": "Paetow High School" },
    { "value": "st_agnes", "label": "St. Agnes Academy" },
    { "value": "st_johns", "label": "St. John's School" },
    { "value": "stratford_high", "label": "Stratford High School" },
    { "value": "strake_jesuit", "label": "Strake Jesuit College Preparatory" },
    { "value": "west_university", "label": "West University Elementary School" },
    { "value": "westbury_high", "label": "Westbury High School" },
    { "value": "westside_high", "label": "Westside High School" },

    // New York, NY
    { "value": "bronx_science", "label": "Bronx High School of Science" },
    { "value": "brooklyn_tech", "label": "Brooklyn Technical High School" },
    { "value": "collegiate_school", "label": "Collegiate School" },
    { "value": "dalton_school", "label": "Dalton School" },
    { "value": "horace_mann", "label": "Horace Mann School" },
    { "value": "hunter_college", "label": "Hunter College High School" },
    { "value": "stuyvesant", "label": "Stuyvesant High School" },
    { "value": "trinity_ny", "label": "Trinity School" },

    // Los Angeles, CA
    { "value": "beverly_hills", "label": "Beverly Hills High School" },
    { "value": "brentwood_school", "label": "Brentwood School" },
    { "value": "crossroads_la", "label": "Crossroads School" },
    { "value": "harvard_westlake", "label": "Harvard-Westlake School" },
    { "value": "loyola_la", "label": "Loyola High School" },
    { "value": "marlborough_la", "label": "Marlborough School" },
    { "value": "palisades", "label": "Palisades Charter High School" },
    { "value": "poly_pasadena", "label": "Polytechnic School" },

    // Chicago, IL
    { "value": "latin_chicago", "label": "Latin School of Chicago" },
    { "value": "lincoln_park", "label": "Lincoln Park High School" },
    { "value": "northside_prep", "label": "Northside College Preparatory High School" },
    { "value": "payton_chicago", "label": "Walter Payton College Prep" },
    { "value": "whitney_young", "label": "Whitney M. Young Magnet High School" },

    // San Francisco Bay Area, CA
    { "value": "castilleja", "label": "Castilleja School" },
    { "value": "crystal_springs", "label": "Crystal Springs Uplands School" },
    { "value": "gunn_high", "label": "Gunn High School" },
    { "value": "harker", "label": "Harker School" },
    { "value": "lick_wilmerding", "label": "Lick-Wilmerding High School" },
    { "value": "lowell", "label": "Lowell High School" },
    { "value": "menlo_atherton", "label": "Menlo-Atherton High School" },
    { "value": "menlo_school", "label": "Menlo School" },
    { "value": "paly", "label": "Palo Alto High School" },
    { "value": "pinewood", "label": "Pinewood School" },
    { "value": "sacred_heart_prep", "label": "Sacred Heart Preparatory" },

    // Boston, MA
    { "value": "bbns", "label": "Buckingham Browne & Nichols School" },
    { "value": "boston_latin", "label": "Boston Latin School" },
    { "value": "commonwealth_boston", "label": "Commonwealth School" },
    { "value": "milton_academy", "label": "Milton Academy" },
    { "value": "nobles", "label": "Noble and Greenough School" },
    { "value": "roxbury_latin", "label": "Roxbury Latin School" },
    { "value": "winsor", "label": "Winsor School" },

    // Washington, DC Metro
    { "value": "BASIS_mclean", "label": "BASIS Independent McLean" },
    { "value": "holton_arms", "label": "Holton-Arms School" },
    { "value": "landon", "label": "Landon School" },
    { "value": "maret", "label": "Maret School" },
    { "value": "national_cathedral", "label": "National Cathedral School" },
    { "value": "sidwell_friends", "label": "Sidwell Friends School" },
    { "value": "st_albans_dc", "label": "St. Albans School" },
    { "value": "tj_hsst", "label": "Thomas Jefferson High School for Science and Technology" },

    // Philadelphia, PA
    { "value": "central_philly", "label": "Central High School" },
    { "value": "friends_central", "label": "Friends' Central School" },
    { "value": "germantown_friends", "label": "Germantown Friends School" },
    { "value": "haverford_school", "label": "Haverford School" },
    { "value": "masterman", "label": "Julia R. Masterman School" },
    { "value": "penn_charter", "label": "Penn Charter School" },

    // Atlanta, GA
    { "value": "lovett", "label": "Lovett School" },
    { "value": "pace_academy", "label": "Pace Academy" },
    { "value": "paideia", "label": "Paideia School" },
    { "value": "westminster_atl", "label": "Westminster Schools" },

    // Seattle, WA
    { "value": "lakeside_seattle", "label": "Lakeside School" },
    { "value": "roosevelt_seattle", "label": "Roosevelt High School" },

    // Dallas, TX
    { "value": "hockaday", "label": "Hockaday School" },
    { "value": "st_marks_dallas", "label": "St. Mark's School of Texas" },

    // Additional Major Cities
    { "value": "detroit_country_day", "label": "Detroit Country Day School" },
    { "value": "miami_palmetto", "label": "Miami Palmetto Senior High School" },
    { "value": "ransom_everglades", "label": "Ransom Everglades School" },
    { "value": "phoenix_country_day", "label": "Phoenix Country Day School" },
    { "value": "denver_east", "label": "Denver East High School" },
];

export const seedHighSchools = async () => {
  console.log('Starting to seed high schools collection...');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const school of initialHighSchools) {
      try {
        // Add metadata
        const schoolWithMetadata = {
          ...school,
          createdAt: new Date(),
          userGenerated: false, // Flag to indicate this is from initial seed
        };

        // Use sanitized value as document ID for consistency
        const docId = school.value;
        await setDoc(doc(db, 'high_schools', docId), schoolWithMetadata);

        console.log(`✓ Seeded: ${school.label}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error seeding ${school.label}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Seeding Complete ===');
    console.log(`✓ Successfully seeded: ${successCount} high schools`);
    console.log(`✗ Failed: ${errorCount} high schools`);
    console.log(`Total: ${initialHighSchools.length} high schools`);

    return { successCount, errorCount, total: initialHighSchools.length };
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    throw error;
  }
};

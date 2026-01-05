import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';

const SESSION_STORAGE_KEY = 'high_schools_cache';
const CACHE_TIMESTAMP_KEY = 'high_schools_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

/**
 * High School Service
 * Manages dynamic high school list with Firebase and session caching
 *
 * Features:
 * - Loads high schools from Firebase
 * - Caches in sessionStorage for performance
 * - Allows adding new schools on-the-fly
 * - Automatic cache invalidation
 */

/**
 * Load high schools from cache or Firebase
 * @returns {Promise<Array>} Array of high school objects with {value, label}
 */
export const loadHighSchools = async () => {
  try {
    // Check if we have a valid cache
    const cachedSchools = getCachedHighSchools();
    if (cachedSchools) {
      console.log('📚 Loaded high schools from session cache');
      return cachedSchools;
    }

    // No valid cache, fetch from Firebase
    console.log('🔄 Fetching high schools from Firebase...');
    const schools = await fetchHighSchoolsFromFirebase();

    // Cache the results
    cacheHighSchools(schools);

    console.log(`✓ Loaded ${schools.length} high schools from Firebase`);
    return schools;
  } catch (error) {
    console.error('Error loading high schools:', error);
    // Return empty array on error, component will handle fallback
    return [];
  }
};

/**
 * Fetch high schools from Firebase
 * @returns {Promise<Array>} Array of high school objects
 */
const fetchHighSchoolsFromFirebase = async () => {
  const highSchoolsRef = collection(db, 'high_schools');
  const q = query(highSchoolsRef, orderBy('label', 'asc'));
  const snapshot = await getDocs(q);

  const schools = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return schools;
};

/**
 * Add a new high school to Firebase and update cache
 * @param {string} schoolName - The name of the high school to add
 * @returns {Promise<Object>} The newly created high school object
 */
export const addHighSchool = async (schoolName) => {
  try {
    // Normalize the school name (trim whitespace, proper capitalization)
    const normalizedName = normalizeSchoolName(schoolName);

    // Check if it already exists in Firebase
    const exists = await checkHighSchoolExists(normalizedName);
    if (exists) {
      console.log(`High school "${normalizedName}" already exists`);
      return exists;
    }

    // Create the new high school object
    const newSchool = {
      value: normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      label: normalizedName,
      createdAt: new Date(),
      userGenerated: true // Flag to indicate this was added by a user
    };

    // Add to Firebase
    const docRef = await addDoc(collection(db, 'high_schools'), newSchool);
    const createdSchool = { id: docRef.id, ...newSchool };

    // Update cache with new school
    const currentCache = getCachedHighSchools() || [];
    const updatedCache = [...currentCache, createdSchool].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    cacheHighSchools(updatedCache);

    console.log(`✓ Added new high school: ${normalizedName}`);
    return createdSchool;
  } catch (error) {
    console.error('Error adding high school:', error);
    throw error;
  }
};

/**
 * Check if a high school already exists in Firebase
 * @param {string} schoolName - The school name to check
 * @returns {Promise<Object|null>} The existing school object or null
 */
const checkHighSchoolExists = async (schoolName) => {
  const highSchoolsRef = collection(db, 'high_schools');
  const q = query(highSchoolsRef, where('label', '==', schoolName));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
};

/**
 * Normalize school name (proper capitalization, trim whitespace)
 * @param {string} schoolName - Raw school name input
 * @returns {string} Normalized school name
 */
const normalizeSchoolName = (schoolName) => {
  return schoolName
    .trim()
    .split(' ')
    .map(word => {
      // Keep common abbreviations uppercase (HS, MS, K-12, etc.)
      if (word.match(/^[A-Z]+$/) || word.match(/^\d+-\d+$/)) {
        return word.toUpperCase();
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Get high schools from session cache if valid
 * @returns {Array|null} Cached schools or null if cache invalid/expired
 */
const getCachedHighSchools = () => {
  try {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) return null;

    // Check if cache is expired
    const cacheAge = Date.now() - parseInt(timestamp);
    if (cacheAge > CACHE_DURATION) {
      console.log('⏰ Cache expired, will refresh');
      clearHighSchoolCache();
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * Cache high schools in sessionStorage
 * @param {Array} schools - Array of high school objects to cache
 */
const cacheHighSchools = (schools) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(schools));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

/**
 * Clear the high school cache
 */
export const clearHighSchoolCache = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
};

/**
 * Force refresh high schools from Firebase
 * @returns {Promise<Array>} Fresh array of high schools
 */
export const refreshHighSchools = async () => {
  clearHighSchoolCache();
  return loadHighSchools();
};

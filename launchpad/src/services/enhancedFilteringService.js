import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { careerInterests } from '../pages/Onboarding/Options';
import FilterStateManager from './filterStateManager';

class EnhancedFilteringService {
  constructor(collectionType = 'users') {
    this.collectionType = collectionType;
    this.filterManager = new FilterStateManager({}, collectionType);
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Main filtering method that combines Firebase and client-side filtering
  async getFilteredData(filters, currentUserId, category = null, lastDoc = null, maxLimit = 6) {
    try {
      // Update filter manager with new filters
      this.filterManager.updateFilters(filters);
      
      // Get Firebase-compatible filters
      const firebaseFilters = this.filterManager.getFirebaseFilters();
      
      // Get client-side filters
      const clientSideFilters = this.filterManager.getClientSideFilters();
      
      // Build Firebase query
      let q = collection(db, "tenants", localStorage.getItem("schoolId"), this.collectionType);
      
      // Apply Firebase filters
      Object.entries(firebaseFilters).forEach(([key, filter]) => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Add category filter if specified
      if (category && this.collectionType === "users") {
        q = query(q, where('userType', '==', category));
        q = query(q, orderBy('userName'));
      }

      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(maxLimit));

      // Execute Firebase query
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out current user
      results = results.filter((user) => user.id !== currentUserId);

      // Apply client-side filters
      if (Object.keys(clientSideFilters).length > 0) {
        results = this.applyClientSideFilters(results, clientSideFilters, currentUserId);
      }

      // Sort results by relevance
      if (this.collectionType === 'users') {
        results = await this.sortByRelevance(results, currentUserId);
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { results, lastVisible };

    } catch (error) {
      console.error('Error in enhanced filtering:', error);
      throw error;
    }
  }

  // Apply client-side filters with complex logic
  applyClientSideFilters(results, clientSideFilters, currentUserId) {
    return results.filter(item => {
      return Object.entries(clientSideFilters).every(([filterId, filterValue]) => {
        return this.evaluateClientSideFilter(item, filterId, filterValue, currentUserId);
      });
    });
  }

  // Evaluate individual client-side filter
  evaluateClientSideFilter(item, filterId, filterValue, currentUserId) {
    switch (filterId) {
      case 'areasOfInterest':
        return this.evaluateInterestFilter(item, filterValue, currentUserId);
      
      case 'collegeInterests':
        return this.evaluateCollegeFilter(item, filterValue, currentUserId);
      
      case 'location':
        return this.evaluateLocationFilter(item, filterValue);
      
      case 'availability':
        return this.evaluateAvailabilityFilter(item, filterValue);
      
      case 'experienceLevel':
        return this.evaluateExperienceFilter(item, filterValue);
      
      default:
        return true;
    }
  }

  // Evaluate interest-based filtering
  async evaluateInterestFilter(item, filterValue, currentUserId) {
    if (filterValue === 'my_interests') {
      try {
        const userData = await this.getUserData(currentUserId);
        const userInterests = userData?.areasOfInterest || [];
        
        if (userInterests.length === 0) return true;
        
        // Check if item has any of user's interests
        const itemInterests = this.collectionType === 'opportunities' 
          ? item.organizationTags || []
          : item.areasOfInterest || [];
        
        return userInterests.some(interest => 
          itemInterests.includes(interest)
        );
      } catch (error) {
        console.error('Error evaluating interest filter:', error);
        return true;
      }
    }
    return true;
  }

  // Evaluate college-based filtering
  async evaluateCollegeFilter(item, filterValue, currentUserId) {
    if (filterValue === 'my_colleges') {
      try {
        const userData = await this.getUserData(currentUserId);
        const userColleges = userData?.collegeInterestsOrDecision || [];
        
        if (userColleges.length === 0) return true;
        
        const itemCollege = item.collegeAttending;
        return userColleges.includes(itemCollege);
      } catch (error) {
        console.error('Error evaluating college filter:', error);
        return true;
      }
    } else if (filterValue === 'my_dream_colleges') {
      try {
        const userData = await this.getUserData(currentUserId);
        const userDreamColleges = userData?.collegeInterestsOrDecision || [];
        
        if (userDreamColleges.length === 0) return true;
        
        const itemCollege = item.collegeAttending;
        return userDreamColleges.includes(itemCollege);
      } catch (error) {
        console.error('Error evaluating dream college filter:', error);
        return true;
      }
    }
    return true;
  }

  // Evaluate location-based filtering
  evaluateLocationFilter(item, filterValue) {
    if (filterValue === 'any_location') return true;
    
    const itemLocation = item.location || 'unknown';
    return filterValue.includes(itemLocation);
  }

  // Evaluate availability-based filtering
  evaluateAvailabilityFilter(item, filterValue) {
    if (filterValue === 'any_availability') return true;
    
    const itemAvailability = item.availability || [];
    return filterValue.some(avail => itemAvailability.includes(avail));
  }

  // Evaluate experience level filtering
  evaluateExperienceFilter(item, filterValue) {
    if (filterValue === 'any_experience') return true;
    
    const itemExperience = item.experienceLevel || 'unknown';
    return filterValue === itemExperience;
  }

  // Sort results by relevance to user interests
  async sortByRelevance(results, currentUserId) {
    try {
      const userData = await this.getUserData(currentUserId);
      const userInterests = userData?.areasOfInterest || [];
      
      if (userInterests.length === 0) return results;
      
      const originalInterests = new Set(userInterests);
      
      return results.sort((a, b) => {
        const aMatches = this.calculateInterestMatches(a, originalInterests);
        const bMatches = this.calculateInterestMatches(b, originalInterests);
        return bMatches - aMatches; // descending order
      });
    } catch (error) {
      console.error('Error sorting by relevance:', error);
      return results;
    }
  }

  // Calculate interest matches for an item
  calculateInterestMatches(item, userInterests) {
    try {
      const itemInterests = this.collectionType === 'opportunities' 
        ? item.organizationTags || []
        : item.areasOfInterest || [];
      
      return itemInterests.filter(tag => userInterests.has(tag)).length;
    } catch (error) {
      return 0;
    }
  }

  // Get extended interests based on career interest groups
  getExtendedInterests(initialInterests) {
    if (!initialInterests || initialInterests.length === 0) return [];
    
    const initialInterestSet = new Set(initialInterests);
    
    const groupMap = careerInterests.reduce((acc, interest) => {
      if (!acc[interest.group]) {
        acc[interest.group] = [];
      }
      acc[interest.group].push(interest.label);
      return acc;
    }, {});
    
    const relevantGroups = careerInterests
      .filter(interest => initialInterestSet.has(interest.label))
      .map(interest => interest.group);
    
    const extendedInterests = [...new Set(
      relevantGroups.flatMap(group => groupMap[group])
    )];

    // Sort by relevance (user's interests first)
    extendedInterests.sort((a, b) => {
      if (initialInterestSet.has(a) && !initialInterestSet.has(b)) return -1;
      if (!initialInterestSet.has(a) && initialInterestSet.has(b)) return 1;
      return 0;
    });
    
    return extendedInterests;
  }

  // Get user data with caching
  async getUserData(currentUserId) {
    const cacheKey = `user_${currentUserId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    try {
      const userSnap = await getDoc(doc(db, "tenants", localStorage.getItem("schoolId"), "users", currentUserId));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        this.cache.set(cacheKey, {
          data: userData,
          timestamp: Date.now()
        });
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get filter manager for external use
  getFilterManager() {
    return this.filterManager;
  }

  // Get current filter state
  getCurrentFilters() {
    return this.filterManager.getFilters();
  }

  // Get active filter count
  getActiveFilterCount() {
    return this.filterManager.getActiveFilterCount();
  }

  // Check if filters have changed
  hasFilterChanges() {
    return this.filterManager.hasActiveFilters();
  }
}

export default EnhancedFilteringService;

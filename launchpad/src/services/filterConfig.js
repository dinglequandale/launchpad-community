// Filter Configuration System
// This file defines all available filters with their metadata, validation, and UI properties

export const FILTER_TYPES = {
  SELECT: 'select',
  MULTI_SELECT: 'multi_select',
  SEARCH_SELECT: 'search_select',
  RANGE: 'range',
  DATE_RANGE: 'date_range',
  BOOLEAN: 'boolean',
  TAG_INPUT: 'tag_input'
};

export const FILTER_OPERATORS = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  GREATER_THAN_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_THAN_EQUAL: '<=',
  IN: 'in',
  NOT_IN: 'not-in',
  ARRAY_CONTAINS: 'array-contains',
  ARRAY_CONTAINS_ANY: 'array-contains-any',
  TEXT_SEARCH: 'text-search',
  GEO_NEAR: 'geo-near'
};

// Filter definitions for different collections
export const USER_FILTERS = {
  userType: {
    id: 'userType',
    label: 'User Type',
    type: FILTER_TYPES.SELECT,
    placeholder: 'Select user type',
    options: [
      { value: 'any', label: 'Any User Type', default: true },
      { value: 'High Schooler', label: 'High School Students' },
      { value: 'Alumni', label: 'College Students' },
      { value: 'Professional', label: 'Professionals' }
    ],
    firebaseField: 'userType',
    firebaseOperator: FILTER_OPERATORS.EQUALS,
    clientSide: false,
    searchable: false
  },

  areasOfInterest: {
    id: 'areasOfInterest',
    label: 'Areas of Interest',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select interests',
    options: [
      { value: 'my_interests', label: 'My Interests', default: true },
      { value: 'any_interests', label: 'Any Interests' }
    ],
    firebaseField: 'areasOfInterest',
    firebaseOperator: FILTER_OPERATORS.ARRAY_CONTAINS_ANY,
    clientSide: true,
    searchable: true,
    dynamicOptions: true // Will be populated from careerInterests
  },

  collegeInterests: {
    id: 'collegeInterests',
    label: 'College',
    type: FILTER_TYPES.SEARCH_SELECT,
    placeholder: 'Search colleges',
    options: [
      { value: 'any_college', label: 'Any College', default: true },
      { value: 'my_colleges', label: 'My Colleges' },
      { value: 'my_dream_colleges', label: 'My Dream Colleges' }
    ],
    firebaseField: 'collegeInterestsOrDecision',
    firebaseOperator: FILTER_OPERATORS.IN,
    clientSide: true,
    searchable: true,
    dynamicOptions: true
  },

  networkingCommitment: {
    id: 'networkingCommitment',
    label: 'Commitment Level',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select commitment levels',
    options: [
      { value: 'any_commitment', label: 'Any Commitment Level', default: true },
      { value: 'casual', label: 'Casual Connections' },
      { value: 'general_inquiries', label: 'General Inquiries' },
      { value: 'coffee_chats', label: 'Short Interviews / Coffee Chats' },
      { value: 'guest_speaking', label: 'Guest Speaking' },
      { value: 'project_support', label: 'Project Support' },
      { value: 'mentorship', label: 'Mentorship' },
      { value: 'workplace_opportunities', label: 'Workplace Opportunities' }
    ],
    firebaseField: 'networkingCommitment',
    firebaseOperator: FILTER_OPERATORS.ARRAY_CONTAINS_ANY,
    clientSide: false,
    searchable: false
  },

  location: {
    id: 'location',
    label: 'Location',
    type: FILTER_TYPES.SEARCH_SELECT,
    placeholder: 'Search locations',
    options: [
      { value: 'any_location', label: 'Any Location', default: true },
      { value: 'remote', label: 'Remote' },
      { value: 'on_site', label: 'On-site' },
      { value: 'hybrid', label: 'Hybrid' }
    ],
    firebaseField: 'location',
    firebaseOperator: FILTER_OPERATORS.EQUALS,
    clientSide: true,
    searchable: true
  },

  experienceLevel: {
    id: 'experienceLevel',
    label: 'Experience Level',
    type: FILTER_TYPES.SELECT,
    placeholder: 'Select experience level',
    options: [
      { value: 'any_experience', label: 'Any Experience Level', default: true },
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' }
    ],
    firebaseField: 'experienceLevel',
    firebaseOperator: FILTER_OPERATORS.EQUALS,
    clientSide: false,
    searchable: false
  },

  availability: {
    id: 'availability',
    label: 'Availability',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select availability',
    options: [
      { value: 'any_availability', label: 'Any Availability', default: true },
      { value: 'weekdays', label: 'Weekdays' },
      { value: 'weekends', label: 'Weekends' },
      { value: 'evenings', label: 'Evenings' },
      { value: 'flexible', label: 'Flexible' }
    ],
    firebaseField: 'availability',
    firebaseOperator: FILTER_OPERATORS.ARRAY_CONTAINS_ANY,
    clientSide: true,
    searchable: false
  }
};

export const OPPORTUNITY_FILTERS = {
  organizationType: {
    id: 'organizationType',
    label: 'Category',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select categories',
    options: [
      { value: 'any_category', label: 'Any Category', default: true },
      { value: 'Club', label: 'Clubs' },
      { value: 'Internship', label: 'Workplace Opportunities' },
      { value: 'Nonprofit', label: 'Nonprofits' },
      { value: 'Business', label: 'Businesses' },
      { value: 'Community Service', label: 'Community Service' },
      { value: 'Youth Leadership', label: 'Leadership' }
    ],
    firebaseField: 'organizationType',
    firebaseOperator: FILTER_OPERATORS.IN,
    clientSide: false,
    searchable: false
  },

  areasOfInterest: {
    id: 'areasOfInterest',
    label: 'Subject Matter',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select subjects',
    options: [
      { value: 'any_subject', label: 'Any Subject Matter', default: true },
      { value: 'my_interests', label: 'My Interests' }
    ],
    firebaseField: 'organizationTags',
    firebaseOperator: FILTER_OPERATORS.ARRAY_CONTAINS_ANY,
    clientSide: true,
    searchable: true,
    dynamicOptions: true
  },

  commitmentLevel: {
    id: 'commitmentLevel',
    label: 'Time Commitment',
    type: FILTER_TYPES.SELECT,
    placeholder: 'Select time commitment',
    options: [
      { value: 'any_commitment', label: 'Any Time Commitment', default: true },
      { value: 'one_time', label: 'One-time' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'seasonal', label: 'Seasonal' },
      { value: 'flexible', label: 'Flexible' }
    ],
    firebaseField: 'commitmentLevel',
    firebaseOperator: FILTER_OPERATORS.EQUALS,
    clientSide: false,
    searchable: false
  },

  location: {
    id: 'location',
    label: 'Location',
    type: FILTER_TYPES.MULTI_SELECT,
    placeholder: 'Select locations',
    options: [
      { value: 'any_location', label: 'Any Location', default: true },
      { value: 'remote', label: 'Remote' },
      { value: 'on_site', label: 'On-site' },
      { value: 'hybrid', label: 'Hybrid' }
    ],
    firebaseField: 'location',
    firebaseOperator: FILTER_OPERATORS.IN,
    clientSide: true,
    searchable: false
  }
};

// Filter groups for different pages
export const FILTER_GROUPS = {
  network: {
    title: 'Network Filters',
    description: 'Filter users in your network',
    filters: ['userType', 'areasOfInterest', 'collegeInterests', 'networkingCommitment', 'location', 'experienceLevel', 'availability']
  },
  opportunities: {
    title: 'Opportunity Filters',
    description: 'Filter available opportunities',
    filters: ['organizationType', 'areasOfInterest', 'commitmentLevel', 'location']
  }
};

// Helper functions
export const getFilterConfig = (filterId, collectionType = 'users') => {
  const allFilters = { ...USER_FILTERS, ...OPPORTUNITY_FILTERS };
  return allFilters[filterId];
};

export const getFilterGroup = (groupName) => {
  return FILTER_GROUPS[groupName];
};

export const isClientSideFilter = (filterId) => {
  const config = getFilterConfig(filterId);
  return config?.clientSide || false;
};

export const getFirebaseFilters = (filters, collectionType = 'users') => {
  const firebaseFilters = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    const config = getFilterConfig(key, collectionType);
    if (config && !config.clientSide && value && !value.toString().startsWith('any_')) {
      firebaseFilters[key] = {
        field: config.firebaseField,
        operator: config.firebaseOperator,
        value: value
      };
    }
  });
  
  return firebaseFilters;
};

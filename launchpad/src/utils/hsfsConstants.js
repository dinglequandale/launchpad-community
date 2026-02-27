// HSFS (Houston Finance Society) Constants
// Centralizes all HSFS-specific data for use across landing page, onboarding, and network filtering

export const HSFS_INDUSTRIES = [
  { value: "banking", label: "Banking" },
  { value: "capital_markets", label: "Capital Markets & Investment Banking" },
  { value: "asset_management", label: "Asset & Portfolio Management" },
  { value: "insurance", label: "Insurance" },
  { value: "financial_services", label: "Financial Services" },
  { value: "real_estate_finance", label: "Real Estate Finance" },
  { value: "tax_accounting", label: "Tax and Accounting Firms" },
];

export const HSFS_SCHOOLS = [
  { value: "awty_international", label: "Awty International School" },
  { value: "st_johns", label: "St. John's School" },
  { value: "john_cooper", label: "John Cooper School" },
  { value: "village_school", label: "Village School" },
  { value: "kinkaid_school", label: "The Kinkaid School" },
  { value: "emery_weiner", label: "The Emery/Weiner School" },
  { value: "episcopal_high", label: "Episcopal High School" },
  { value: "strake_jesuit", label: "Strake Jesuit Preparatory" },
  { value: "duchesne_school", label: "Duchesne School" },
  { value: "carnegie_vanguard", label: "Carnegie Vanguard School" },
  { value: "debakey_high", label: "DeBakey High School" },
  { value: "houston_christian", label: "Houston Christian High School" },
];

export const HSFS_USER_TYPES = [
  { id: 'highschool', label: 'High Schooler' },
  { id: 'professional', label: 'Professional' },
];

export const HSFS_LANDING_CONTENT = {
  heroTitle: "Connecting Houston's Young Finance Leaders",
  heroDescription: "Launching Houston's student leaders into real-world finance and business opportunities through meaningful connections and collaborative learning.",
  heroCTA: "Join the Network",
  heroCTASecondary: "Citywide Network",

  whyChooseTitle: "Why Choose HSFS?",
  whyChooseSubtitle: "Everything students need to explore finance, investing, and business\u2014all in one collaborative platform.",

  featureCards: [
    {
      title: "Make Invaluable Connections",
      text: "Connect with peers across Houston's top high schools, as well as industry professionals, professors, and advisors, all committed to supporting your growth. With one click, you gain access to guidance, mentorship, and networking opportunities.",
    },
    {
      title: "Discover Unique Opportunities",
      text: "Participate in speaker events, workshops, and collaborative projects. Learn from students, professionals, and professors who have excelled in finance and business, while gaining exposure to internships, competitions, and leadership roles.",
    },
    {
      title: "Build Your Finance & Investing Portfolio",
      text: "Develop real-world skills and hands-on experience in finance, investing, and business. Participate in collaborative projects, competitions, and citywide initiatives that strengthen your knowledge, expand your network, and showcase your leadership.",
    },
  ],

  empoweringTitle: "Empowering Student Leaders",
  networkGrid: [
    "Motivated high school students",
    "Experienced professionals and mentors",
    "Active school clubs and organizations",
  ],

  missionTitle: "Our Mission",
  missionText: "We act as a citywide platform for high school students' finance and business potential, connecting peers, professionals, and educators. By fostering collaboration and providing access to real-world opportunities, we empower students to strengthen their portfolios, leadership experience, and career readiness.",

  visionTitle: "Our Vision",
  visionText: "To give students across Houston accessible learning, leadership, and professional opportunities in finance and business.",

  ctaTitle: "Start Your Journey",
  ctaDescription: "Join our community of ambitious students, successful alumni, and industry professionals\u2014and begin building your future in finance and investing.",
  ctaAccessCodeText: "Enter access code provided by HSFS to join",
  ctaAccessCodeHelp: "If you do not have access to it, contact houstonstudentfinancesociety@gmail.com",

  // Subtab content for Professionals
  professionalTab: {
    title: "For Professionals: Inspire, Influence, Connect",
    cards: [
      {
        title: "Guide the Next Generation",
        text: "Share your expertise and experience with motivated high school students eager to learn about finance, investing, and business. By mentoring, giving talks, or providing insights, you shape the leaders of tomorrow.",
      },
      {
        title: "Expand Your Network",
        text: "Connect with fellow professionals, educators, and HSFS members who are equally passionate about fostering student excellence. Collaborate, share ideas, and form meaningful relationships within the finance and business community.",
      },
      {
        title: "Promote Opportunities",
        text: "Looking for interns, volunteers, or participants for your projects? Use HSFS to share opportunities directly with high-achieving students and other professionals, giving your initiatives maximum impact.",
      },
    ],
  },

  // Subtab content for High School Students
  highSchoolerTab: {
    title: "For High School Students: Learn, Lead, Launch",
    cards: [
      {
        title: "Make Valuable Connections",
        text: "Engage with professionals, mentors, and peers from top Houston schools. Build relationships that provide guidance, networking opportunities, and exposure to real-world finance and business environments.",
      },
      {
        title: "Discover Opportunities",
        text: "Explore internships, volunteering, and leadership positions tailored to your interests. Gain hands-on experience, learn from mentors, and strengthen your portfolio for college and beyond.",
      },
      {
        title: "Explore Careers and Education",
        text: "Learn about different finance and business pathways, receive guidance on academic and professional choices, and connect with mentors who can provide insight into careers and college opportunities.",
      },
    ],
  },
};

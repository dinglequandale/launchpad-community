// Utility functions for subdomain-based customization

export const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return 'default';
  }
  
  // Extract subdomain (first part before the first dot)
  const subdomain = parts.length > 2 ? parts[0] : 'default';
  
  return subdomain;
};

export const getSchoolConfig = (subdomain) => {
  const configs = {
    awty: {
      schoolName: "Awty International",
      schoolShortName: "Awty",
      networkName: "Ram Network",
      mascotImage: "/assets/awty_school.png",
      mascotName: "Ram",
      ctaText: "Join the Ram Network",
      ctaButtonText: "Join the Ram Network",
      heroSubtitle: "Launching Awty's youth into collegiate and professional success",
      whoAreWe: "Launchpad is a free local social network designed to empower Awty's youth by creating meaningful connections among:",
      mission: "We act as a launchpad for high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and high quality resources, we empower our youth to strengthen their portfolio of work experience and extracurriculars.",
      goal: "Our aim is to provide Awty's youth with accessible learning, leadership, and workplace opportunities.",
      featureCards: {
        highschooler: [
          {
            title: "Make Invaluable Connections",
            text: "Connect with industry professionals, undergraduates at your dream school, and like-minded peers— all committed to helping you. With just one click, you gain access to a world of opportunities.",
          },
          {
            title: "Discover Meaningful Opportunities",
            text: "Find volunteer and leadership positions in town, in line with your interests. Discover workplace opportunities while learning from undergrads and professionals who have done what you want to do!",
          },
          {
            title: "Explore Careers & Colleges",
            text: "Complete reputed surveys to find the careers that best suit you. Connect with undergrads and professionals in your fields of interest to gain insight on college and work life. Explore shadow, intern, and job opportunities.",
          },
        ],
        alumni: [
          {
            title: "Explore Careers & Opportunities",
            text: "Connect with professionals in your fields of interest to gain insights on work life and explore intern/job opportunities! Talk with other skilled undergrads. Complete reputed surveys to find the careers that best suit you.",
          },
          {
            title: "Discover Meaningful Opportunities",
            text: "Many students seek to follow in your footsteps and attend the same colleges. Share your experiences, offer advice, and help guide Awty's next generation!",
          },
          {
            title: "Promote Your Initiatives",
            text: "Have a growing business? A budding project? Promote your initiative to professionals. Looking for help? Accelerate your project by connecting with talented undergraduates and high schoolers!",
          },
        ],
        professional: [
          {
            title: "Guide the Next Generation",
            text: "Our platform hosts an exceptional youth studying at Awty and top U.S colleges (Princeton, Carnegie Mellon, etc ...), all eager to excel. By joining Launchpad, you are empowered to shape their future by offering insights, advice, and workplace opportunities.",
          },
          {
            title: "Expand Your Professional Network",
            text: "As a professional, you are certainly not limited to networking with students. Indeed, Launchpad equips users with powerful search filters to seamlessly connect with other professionals in the Awty community!",
          },
          {
            title: "Promote Opportunities",
            text: "Have any internship positions open? Looking for volunteers for a certain project? Open to job applications? Promote your listings to qualified undergraduates and/or motivated highschoolers!",
          },
        ],
      },
    },
    default: {
      schoolName: "Your School",
      schoolShortName: "school",
      networkName: "Student Network",
      mascotImage: "/assets/launchpad_logo.png",
      mascotName: "Student",
      ctaText: "Get Started",
      ctaButtonText: "Get Started",
      heroSubtitle: "Launching students into collegiate and professional success",
      whoAreWe: "Launchpad is a free local social network designed to empower students by creating meaningful connections among:",
      mission: "We act as a launchpad for high school students' potential and passion, propelling them into college and beyond. By fostering a vibrant network of mentors, professionals, alumni, and high quality resources, we empower our youth to strengthen their portfolio of work experience and extracurriculars.",
      goal: "Our aim is to provide students with accessible learning, leadership, and workplace opportunities.",
      featureCards: {
        highschooler: [
          {
            title: "Make Invaluable Connections",
            text: "Connect with industry professionals, undergraduates at your dream school, and like-minded peers— all committed to helping you. With just one click, you gain access to a world of opportunities.",
          },
          {
            title: "Discover Meaningful Opportunities",
            text: "Find volunteer and leadership positions in town, in line with your interests. Discover workplace opportunities while learning from undergrads and professionals who have done what you want to do!",
          },
          {
            title: "Explore Careers & Colleges",
            text: "Complete reputed surveys to find the careers that best suit you. Connect with undergrads and professionals in your fields of interest to gain insight on college and work life. Explore shadow, intern, and job opportunities.",
          },
        ],
        alumni: [
          {
            title: "Explore Careers & Opportunities",
            text: "Connect with professionals in your fields of interest to gain insights on work life and explore intern/job opportunities! Talk with other skilled undergrads. Complete reputed surveys to find the careers that best suit you.",
          },
          {
            title: "Discover Meaningful Opportunities",
            text: "Many students seek to follow in your footsteps and attend the same colleges. Share your experiences, offer advice, and help guide the next generation!",
          },
          {
            title: "Promote Your Initiatives",
            text: "Have a growing business? A budding project? Promote your initiative to professionals. Looking for help? Accelerate your project by connecting with talented undergraduates and high schoolers!",
          },
        ],
        professional: [
          {
            title: "Guide the Next Generation",
            text: "Our platform hosts exceptional youth studying at top U.S colleges (Princeton, Carnegie Mellon, etc ...), all eager to excel. By joining Launchpad, you are empowered to shape their future by offering insights, advice, and workplace opportunities.",
          },
          {
            title: "Expand Your Professional Network",
            text: "As a professional, you are certainly not limited to networking with students. Indeed, Launchpad equips users with powerful search filters to seamlessly connect with other professionals in the community!",
          },
          {
            title: "Promote Opportunities",
            text: "Have any internship positions open? Looking for volunteers for a certain project? Open to job applications? Promote your listings to qualified undergraduates and/or motivated highschoolers!",
          },
        ],
      },
    },
  };

  const config = configs[subdomain] || configs.default;
  
  return config;
};

export const useSchoolConfig = () => {
  const subdomain = getSubdomain();
  return getSchoolConfig(subdomain);
}; {}
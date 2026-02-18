export interface Experience {
  company: string;
  role: string;
  duration: string;
  location?: string;
  techStack: string;
  bullets: string[];
}

export interface Project {
  name: string;
  techStack: string;
  year: string;
  location?: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
  gpa: string;
  location?: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface PortfolioData {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  leetcode: string;
  summary: string;
  skills: SkillCategory[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}

export const portfolioData: PortfolioData = {
  name: "Akarshan Sharma",
  title: "Software Engineer",
  phone: "+91-1234567890",
  email: "akaxyz@gmail.com",
  linkedin: "linkedin.com/in/akarshan",
  leetcode: "leetcode.com/aka7shan",
  summary:
    "Passionate Software Engineer with expertise in full-stack development, cloud architecture, and building scalable systems. I love turning complex problems into elegant, user-friendly solutions.",

  skills: [
    {
      category: "Languages",
      skills: ["Java", "C++", "JavaScript", "TypeScript", "Python", "HTML/CSS"],
    },
    {
      category: "Frameworks",
      skills: [
        "Node.js", "SpringBoot", "React", "Express.js", "Redux", "Next.js",
        "React Native", "Vue", "Angular", "Redis", "Hibernate",
      ],
    },
    {
      category: "Database",
      skills: ["MongoDB", "MySQL", "Oracle", "DynamoDB"],
    },
    {
      category: "Testing",
      skills: ["JUnit", "Unit Testing", "TDD", "Code Reviews", "Secure Coding"],
    },
    {
      category: "Monitoring & Performance",
      skills: [
        "Microservices", "Dynatrace", "Log Analysis", "Distributed Systems",
        "Control-M", "AirFlow DAG", "Nexus Repository Manager", "SonarQube", "Linux",
      ],
    },
    {
      category: "Cloud & DevOps",
      skills: [
        "AWS (EC2, S3, Lambda, System Manager, CloudWatch, CloudTrail)",
        "Docker", "CI/CD", "Jenkins", "REST API", "Git/Perforce",
        "GitLab", "Bitbucket",
      ],
    },
    {
      category: "Other",
      skills: [
        "jQuery", "Bootstrap", "ETL", "OOPS", "Agile (Scrum)",
        "VS Code", "IntelliJ",
      ],
    },
  ],

  experience: [
    {
      company: "Amdocs",
      role: "Software Engineer (Core Technology)",
      duration: "Aug 2023 – Present",
      techStack: "Python, React, MongoDB, Redux, JWT, AWS, Node, FastAPI",
      bullets: [
        "Built an end-to-end R&D estimation tool using React for interactive UI and Python/FastAPI backend with MongoDB, enabling accurate man-month calculations based on configurable client specifications.",
        "Streamlined 5+ microservices by implementing async/await patterns, and adding Redis caching cutting response times by 20% and boosting system efficiency.",
        "Engineered a custom Role-Based Access Control (RBAC) middleware with organizational group permissions, implementing fine-grained authorization logic that scaled seamlessly across 10+ production environments.",
        "Boosted user engagement by 30% by redesigning responsive UI using Material UI for centralized state management.",
        "Developed attachment microservice, storing file metadata and paths in MongoDB with actual files on a mounted volume—reliably handling 500+ uploads daily.",
        "Worked with containerized deployments and gained familiarity with Docker concepts.",
        "Migrated core applications from on-prem servers to AWS, Refactored and modularized the Billing & Financial system into WebLogic, Batch, and Online components, improving scalability, fault isolation, and distributing load efficiently across dedicated servers.",
      ],
    },
    {
      company: "Dresma",
      role: "Full Stack Developer",
      duration: "Jan 2023 – July 2023",
      location: "Gurugram",
      techStack: "MERN, React Native, JWT, Expo",
      bullets: [
        "Engineered and optimized RESTful APIs with MVC architecture, integrating Oracle backend with React frontend and leveraging React.memo/useMemo to reduce page load time by 40% (5s → 3s).",
        "Implemented automated testing with Postman and Jenkins, reducing deployment errors and enabling daily releases via CI/CD pipelines.",
        "Implemented OAuth 2.0 and SSO authentication with seamless Microsoft and Google integration, improving user experience, ensuring security compliance, and reducing login friction by 60%.",
        "Integrated MoEngage with custom event tracking hooks and in-app push campaigns, building a Node.js event pipeline for data-driven insights that increased feature adoption by 25% in 3 months.",
        "Built a multi-language architecture with Strapi CMS integration, JSON-based translations, and client-side locale persistence, scaling to 5 regions and increasing active users by 30% (10K+).",
        "Leveraged Agile (Scrum), Jira, and Git to drive iterative product development, enabling rapid feature releases and seamless team collaboration for a cloud-based design editing platform.",
      ],
    },
  ],

  projects: [
    {
      name: "Spotlight",
      techStack: "React, Node.js, JWT",
      year: "2024",
      location: "Pune",
      bullets: [
        "Built a full-stack portfolio builder using the MERN stack, enabling users to input details, upload CVs, and generate professional, shareable portfolios.",
        "Created five distinct portfolio templates that automatically populate user data for instant portfolio generation.",
        "Added a 'Preview as Guest' feature, allowing users to view their portfolio using a temporary customer profile.",
        "Added push notifications and also integrated JWT authentication & OAuth, enhancing security, while utilizing Redux to streamline state handling and improve app performance.",
      ],
    },
  ],

  education: [
    {
      institution: "Thapar Institute of Engineering and Technology",
      degree: "B.Tech in Computer Science and Engineering",
      duration: "Aug 2019 – June 2023",
      gpa: "8.6 CGPA",
      location: "Patiala",
    },
  ],

  certifications: [
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
    { name: "Google Data Analytics", issuer: "Coursera" },
    { name: "Google IT Support", issuer: "Coursera" },
  ],
};

// Fun facts for easter eggs and chat
export const funFacts = [
  "I once debugged a production issue at 3 AM and fixed it with a single semicolon.",
  "My first program was a 'Hello World' in C++ back in high school.",
  "I've reviewed over 500+ pull requests in my career.",
  "I can type at 90+ WPM — verified on MonkeyType!",
  "My go-to debugging strategy: console.log('HERE 1'), console.log('HERE 2')...",
  "I believe tabs > spaces. Fight me.",
  "Coffee consumption is directly proportional to code quality. Prove me wrong.",
  "I once wrote a script to automate ordering lunch. Peak engineering.",
];

// Terminal commands help
export const terminalCommands = {
  help: "Available commands: whoami, skills, experience, projects, education, certifications, contact, neofetch, clear, theme, easter-egg, games, sudo hire akarshan",
  whoami: `${portfolioData.name} — ${portfolioData.title}`,
  about: portfolioData.summary,
  contact: `📧 ${portfolioData.email}\n📱 ${portfolioData.phone}\n🔗 ${portfolioData.linkedin}\n💻 ${portfolioData.leetcode}`,
};


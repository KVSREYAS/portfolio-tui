/** Edit this file to personalize your portfolio. */
export const profile = {
  user: 'vk',
  host: 'venkatakrishnan',
  title: 'Venkatakrishnan K V — terminal',
  headline: 'Venkatakrishnan K V',
  subtitle: 'SWE Intern @ Commvault · B.Tech CS · Bangalore',
  cwd: '~/vk',
  about: [
    'Computer Science student at VIT Vellore (graduating July 2026).',
    'Currently a Software Engineering Intern at Commvault.',
    'Background in ML — computer vision, NLP, and full-stack side projects.',
  ],
  education: {
    school: 'Vellore Institute of Technology, Vellore, Tamil Nadu',
    degree: 'Bachelor of Technology in Computer Science',
    grad: 'Expected July 2026',
    gpa: 'Cumulative GPA: 8.90 / 10',
    coursework:
      'Software Engineering, Operating Systems, Algorithms, Artificial Intelligence',
  },
  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'Commvault',
      dates: 'Present',
      bullets: [],
    },
    {
      role: 'Machine Learning Intern',
      company: 'Kadamba Technologies',
      dates: 'May 2025 – Jul 2025',
      bullets: [
        'Collaborated on a computer vision system to analyze cricket ball trajectories from 2D broadcast video, contributing to the object detection pipeline.',
        'Solely developed physics-based bounce modeling (COR, COF) to reconstruct 3D bounce positions and predict ball path toward stumps.',
        'Bounce parameter estimates within 3% of Hawk-Eye benchmarks; 3,000+ deliveries/day at ~3 seconds per ball.',
      ],
    },
    {
      role: 'Machine Learning Intern',
      company: 'Breakout AI',
      dates: 'Oct 2024 – Feb 2025',
      bullets: [
        'Built an AI system that processes annual report PDFs into a Neo4j knowledge graph of companies, stakeholders, and relationships.',
        'Engineered a LangChain agent to traverse the graph and answer queries in ~5 seconds.',
        'Multi-threaded Python (ThreadPoolExecutor) for 100+ companies; knowledge graph per PDF in under 15 seconds.',
      ],
    },
  ],
  projects: [
    {
      name: 'Misclue',
      period: 'June 2025',
      desc: 'Real-time multiplayer social deduction game — Flask + Socket.IO backend, React frontend, LLMs. Dozens of concurrent games per server.',
      url: 'https://misclue.xyz',
    },
    {
      name: 'Deep Q-Network Lunar Landing Agent',
      period: 'Sept 2024',
      desc: 'DQN agent in OpenAI Gym with experience replay, epsilon-greedy exploration, and PyTorch network from scratch.',
      url: '',
    },
    {
      name: 'DoodleGyan',
      period: 'Sept 2024',
      desc: 'AI comic generator — Stable Diffusion + Llama/Mixtral; Flask backend, React frontend.',
      url: 'https://github.com/KVSREYAS/DoodleGyaan',
    },
  ],
  skills: [
    ['Languages', 'Python · C++ · C · Java · JavaScript · SQL'],
    ['Tools/Tech', 'HTML · CSS · React.js · OpenCV · PyTorch · TensorFlow'],
    ['Domains', 'Machine Learning · Data Analysis · NLP · Computer Vision'],
  ],
  certifications: [
    'Supervised Machine Learning: Regression and Classification — Coursera',
    'Machine Learning: Natural Language Processing in Python (V2)',
  ],
  achievements: [
    {
      title: 'National Finalist — Tredence Hackathon (2025)',
      desc: 'Top teams across India; final round at Tredence HQ, Bangalore.',
    },
    {
      title: 'Top 8 Finalist — DevSoc Hackathon (2025)',
      desc: 'Final round among 100+ teams.',
    },
  ],
  contact: [
    ['Location', '', 'Bangalore'],
    ['Phone', 'tel:+919791052479', '9791052479'],
    ['Email', 'mailto:kvsreyas12@gmail.com', 'kvsreyas12@gmail.com'],
    ['GitHub', 'https://github.com/KVSREYAS', 'github.com/KVSREYAS'],
  ],
}

export type HelpCommand = { cmd: string; desc: string }

export type HelpSection = { title: string; commands: HelpCommand[] }

export const helpSections: HelpSection[] = [
  {
    title: 'Chat',
    commands: [
      { cmd: '<question>', desc: 'Ask VK Twin anything about me' },
    ],
  },
  {
    title: 'Games',
    commands: [
      { cmd: '/play rps', desc: 'Rock paper scissors vs VK Twin' },
      { cmd: '/play hangman', desc: 'Guess the word — VK\'s face takes damage' },
    ],
  },
  {
    title: 'General',
    commands: [
      { cmd: '/help, /?', desc: 'Show this list' },
      { cmd: '/clear', desc: 'Clear the screen' },
      { cmd: '/theme <name>', desc: 'amber | green | paper' },
    ],
  },
  {
    title: 'About',
    commands: [
      { cmd: '/about', desc: 'Bio & skills' },
      { cmd: '/contact', desc: 'Ways to reach me' },
    ],
  },
  {
    title: 'Professional',
    commands: [
      { cmd: '/education', desc: 'Degree & certifications' },
      { cmd: '/experience', desc: 'Internships & work' },
      { cmd: '/projects', desc: 'Personal projects' },
      { cmd: '/achievements', desc: 'Hackathons & awards' },
    ],
  },
]

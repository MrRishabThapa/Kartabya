import { Unit } from '@/types/lessons-types';

export const UNITS: Record<string, Unit> = {
  // ═══════════════════════════════════════════════════════════
  // 🗃️ DATABASE (Vault District)
  // ═══════════════════════════════════════════════════════════
  database: {
    id: 'database',
    title: 'Vault District',
    courseTitle: 'Database Management System',
    color: '#60A5FA',
    accentColor: '#1D4ED8',
    lessons: [
      {
        id: 'db-intro',
        unitId: 'database',
        title: 'Introduction to DBMS',
        description: 'Understand what databases are and why they matter.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 15,
      },
      {
        id: 'db-sql-basics',
        unitId: 'database',
        title: 'SQL Basics',
        description: 'Master SELECT, INSERT, UPDATE, and DELETE queries.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['db-intro'],
        estimatedMinutes: 25,
      },
      {
        id: 'db-normalization-boss',
        unitId: 'database',
        title: 'Database Normalization Challenge',
        description: 'Design a fully normalized schema for a real-world scenario.',
        order: 3,
        type: 'boss',
        hasQuiz: true,
        xpReward: 50,
        prerequisiteIds: ['db-sql-basics'],
        estimatedMinutes: 45,
      },
      {
        id: 'web-html-basics',
        unitId: 'web-technology',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of every website.',
        order: 4,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: ['db-normalization-boss'],
        estimatedMinutes: 20,
      },
        {
        id: 'web-html-basicss',
        unitId: 'web-technology',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of every website.',
        order: 5,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: ['db-normalization-boss'],
        estimatedMinutes: 20,
      },
        {
        id: 'web-html-basicssss ',
        unitId: 'web-technology',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of every website.',
        order: 6,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: ['db-normalization-boss'],
        estimatedMinutes: 20,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🚢 WEB TECHNOLOGY II (Web Harbor)
  // ═══════════════════════════════════════════════════════════
  'web-technology': {
    id: 'web-technology',
    title: 'Web Harbor',
    courseTitle: 'Web Technology II',
    color: '#F5A623',
    accentColor: '#B87908',
    lessons: [
      {
        id: 'web-html-basics',
        unitId: 'web-technology',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of every website.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 20,
      },
      {
        id: 'web-css-styling',
        unitId: 'web-technology',
        title: 'CSS & Styling',
        description: 'Make your pages beautiful with modern CSS techniques.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['web-html-basics'],
        estimatedMinutes: 25,
      },
      {
        id: 'web-js-checkpoint',
        unitId: 'web-technology',
        title: 'JavaScript Checkpoint',
        description: 'Test everything you learned about JS fundamentals.',
        order: 3,
        type: 'checkpoint',
        hasQuiz: true,
        xpReward: 30,
        prerequisiteIds: ['web-css-styling'],
        estimatedMinutes: 20,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 📡 NETWORKING (Antenna District)
  // ═══════════════════════════════════════════════════════════
  networking: {
    id: 'networking',
    title: 'Antenna District',
    courseTitle: 'Networking',
    color: '#2DD4BF',
    accentColor: '#0F766E',
    lessons: [
      {
        id: 'net-osi-model',
        unitId: 'networking',
        title: 'The OSI Model',
        description: 'Understand the 7 layers that power the internet.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 20,
      },
      {
        id: 'net-tcp-ip',
        unitId: 'networking',
        title: 'TCP/IP Protocol Suite',
        description: 'Learn how data actually travels across networks.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['net-osi-model'],
        estimatedMinutes: 30,
      },
      {
        id: 'net-bonus-wireshark',
        unitId: 'networking',
        title: 'Bonus: Packet Sniffing',
        description: 'Explore real network traffic with Wireshark.',
        order: 3,
        type: 'bonus',
        hasQuiz: false,
        xpReward: 25,
        prerequisiteIds: ['net-tcp-ip'],
        estimatedMinutes: 20,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🏭 PROGRAMMING IN C (Factory District)
  // ═══════════════════════════════════════════════════════════
  'programming-c': {
    id: 'programming-c',
    title: 'Factory District',
    courseTitle: 'Programming in C',
    color: '#DC7B4A',
    accentColor: '#9A3412',
    lessons: [
      {
        id: 'c-hello-world',
        unitId: 'programming-c',
        title: 'Hello, C!',
        description: 'Write your very first C program and compile it.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 15,
      },
      {
        id: 'c-variables-loops',
        unitId: 'programming-c',
        title: 'Variables & Loops',
        description: 'Master data types, if-else, and iteration.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['c-hello-world'],
        estimatedMinutes: 30,
      },
      {
        id: 'c-pointers-boss',
        unitId: 'programming-c',
        title: 'Pointers Boss Battle',
        description: 'Conquer the most feared topic in C: pointers!',
        order: 3,
        type: 'boss',
        hasQuiz: true,
        xpReward: 60,
        prerequisiteIds: ['c-variables-loops'],
        estimatedMinutes: 50,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🧩 OOP (Block Plaza)
  // ═══════════════════════════════════════════════════════════
  oop: {
    id: 'oop',
    title: 'Block Plaza',
    courseTitle: 'Object Oriented Programming',
    color: '#FF8D48',
    accentColor: '#C26120',
    lessons: [
      {
        id: 'oop-classes-objects',
        unitId: 'oop',
        title: 'Classes & Objects',
        description: 'The foundation of OOP — model real-world entities in code.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 20,
      },
      {
        id: 'oop-inheritance',
        unitId: 'oop',
        title: 'Inheritance & Polymorphism',
        description: 'Build hierarchies and let objects take many forms.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['oop-classes-objects'],
        estimatedMinutes: 30,
      },
      {
        id: 'oop-checkpoint',
        unitId: 'oop',
        title: 'OOP Design Challenge',
        description: 'Design a system using all four OOP pillars.',
        order: 3,
        type: 'checkpoint',
        hasQuiz: true,
        xpReward: 35,
        prerequisiteIds: ['oop-inheritance'],
        estimatedMinutes: 40,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ♻️ SOFTWARE PROCESS MODEL (Circular District)
  // ═══════════════════════════════════════════════════════════
  'software-process': {
    id: 'software-process',
    title: 'Circular District',
    courseTitle: 'Software Process Model',
    color: '#4ADE80',
    accentColor: '#166534',
    lessons: [
      {
        id: 'sdlc-intro',
        unitId: 'software-process',
        title: 'SDLC Overview',
        description: 'Learn the software development lifecycle from A to Z.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 10,
        prerequisiteIds: [],
        estimatedMinutes: 15,
      },
      {
        id: 'sdlc-agile-vs-waterfall',
        unitId: 'software-process',
        title: 'Agile vs Waterfall',
        description: 'Compare the two most popular development methodologies.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['sdlc-intro'],
        estimatedMinutes: 25,
      },
      {
        id: 'sdlc-bonus-scrum',
        unitId: 'software-process',
        title: 'Bonus: Scrum in Practice',
        description: 'How real teams run sprints, standups, and retrospectives.',
        order: 3,
        type: 'bonus',
        hasQuiz: false,
        xpReward: 25,
        prerequisiteIds: ['sdlc-agile-vs-waterfall'],
        estimatedMinutes: 20,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 🚀 RECENT TRENDS (Futuristic District)
  // ═══════════════════════════════════════════════════════════
  'recent-trends': {
    id: 'recent-trends',
    title: 'Futuristic District',
    courseTitle: 'Recent Trends in Technology',
    color: '#F472B6',
    accentColor: '#9D174D',
    lessons: [
      {
        id: 'trends-ai-ml',
        unitId: 'recent-trends',
        title: 'AI & Machine Learning',
        description: 'Understand how machines learn and make decisions.',
        order: 1,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: [],
        estimatedMinutes: 25,
      },
      {
        id: 'trends-cloud-iot',
        unitId: 'recent-trends',
        title: 'Cloud Computing & IoT',
        description: 'The invisible infrastructure powering modern life.',
        order: 2,
        type: 'lesson',
        hasQuiz: true,
        xpReward: 15,
        prerequisiteIds: ['trends-ai-ml'],
        estimatedMinutes: 25,
      },
      {
        id: 'trends-blockchain-boss',
        unitId: 'recent-trends',
        title: 'Blockchain Deep Dive',
        description: 'The final frontier — decentralized systems and crypto.',
        order: 3,
        type: 'boss',
        hasQuiz: true,
        xpReward: 60,
        prerequisiteIds: ['trends-cloud-iot'],
        estimatedMinutes: 45,
      },
    ],
  },
};

/**
 * 🔍 Helper: Get a specific unit by ID
 */
export function getUnit(unitId: string): Unit | undefined {
  return UNITS[unitId];
}

/**
 * 🔍 Helper: Get a specific lesson within a unit
 */
export function getLesson(unitId: string, lessonId: string) {
  return UNITS[unitId]?.lessons.find((l:any) => l.id === lessonId);
}

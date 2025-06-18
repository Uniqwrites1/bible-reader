// Bible API Types
export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: number[];
}

export interface BibleVerse {
  id: string;
  reference: string;
  content: string;
  verseId: number;
}

export interface BiblePassage {
  id: string;
  reference: string;
  content: string;
  verses: BibleVerse[];
}

export type BibleSection = 'history' | 'psalms' | 'wisdom' | 'prophets' | 'newTestament' | 'revelation';

// Reading Plan Types
export interface ReadingSection {
  id: string;
  name: string;
  color: string;
  books: string[];
}

export interface DailyReading {
  day: number;
  date: string;
  passages: {
    [sectionId: string]: {
      book: string;
      startChapter: number;
      startVerse?: number;
      endChapter: number;
      endVerse?: number;
      reference: string;
      completed: boolean;
    };
  };
  sections: {
    [sectionId: string]: {
      book: string;
      startChapter: number;
      startVerse?: number;
      endChapter: number;
      endVerse?: number;
      reference: string;
      completed: boolean;
    };
  };
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  startDate: string;
  readings: DailyReading[];
  sections: BibleSection[];
  progress: {
    totalDays: number;
    completedDays: number;
    currentDay: number;
  };
  created: string;
  updated: string;
}

export interface ReadingProgress {
  planId: string;
  completedReadings: {
    day: number;
    sectionId: string;
    completedAt: string;
  }[];
}

// App State Types
export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large';
  bibleVersion: string;
  darkMode: boolean;
  autoAdvance: boolean;
  theme: 'light' | 'dark';
  fontFamily: string;
  defaultVersion: string;
  autoMarkRead: boolean;
  showVerseNumbers: boolean;
  notifications: boolean;
  reminderTime: string;
}

export interface UserProfile {
  name?: string;
  email?: string;
  preferences: AppSettings;
  plans: ReadingPlan[];
  progress: ReadingProgress[];
}

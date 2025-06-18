import { addDays, format } from 'date-fns';
import type { ReadingPlan, DailyReading, ReadingSection, BibleSection } from '../types';
import { BIBLE_SECTIONS, BIBLE_BOOKS } from '../data/bibleData';

export class ReadingPlanGenerator {
  generatePlan(name: string, duration: number, startDate: Date): ReadingPlan {
    const readings = this.generateReadings(duration, startDate);    return {
      id: `plan-${Date.now()}`,
      name,
      description: `Read the entire Bible in ${duration} days`,
      duration,
      startDate: format(startDate, 'yyyy-MM-dd'),
      sections: BIBLE_SECTIONS.map(section => section.id) as BibleSection[],
      readings,
      progress: {
        totalDays: duration,
        completedDays: 0,
        currentDay: 1
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }

  private generateReadings(duration: number, startDate: Date): DailyReading[] {    // Calculate total chapters for each section
    const sectionChapters = this.calculateSectionChapters();
    
    // Calculate chapters per day for each section
    const chaptersPerDay = {
      history: Math.ceil(sectionChapters.history / duration),
      psalms: Math.ceil(sectionChapters.psalms / duration),
      wisdom: Math.ceil(sectionChapters.wisdom / duration),
      prophets: Math.ceil(sectionChapters.prophets / duration),
      newTestament: Math.ceil(sectionChapters.newTestament / duration),
      revelation: Math.ceil(sectionChapters.revelation / duration)
    };

    const readings: DailyReading[] = [];
    const sectionProgress = {
      history: { bookIndex: 0, chapter: 1 },
      psalms: { bookIndex: 0, chapter: 1 },
      wisdom: { bookIndex: 0, chapter: 1 },
      prophets: { bookIndex: 0, chapter: 1 },
      newTestament: { bookIndex: 0, chapter: 1 },
      revelation: { bookIndex: 0, chapter: 1 }
    };    for (let day = 1; day <= duration; day++) {
      const currentDate = addDays(startDate, day - 1);
      const dayReading: DailyReading = {
        day,
        date: format(currentDate, 'yyyy-MM-dd'),
        passages: {},
        sections: {}
      };

      // Generate reading for each section
      Object.keys(chaptersPerDay).forEach(sectionId => {
        const section = BIBLE_SECTIONS.find(s => s.id === sectionId);
        if (!section) return;

        const progress = sectionProgress[sectionId as keyof typeof sectionProgress];
        const chapterCount = chaptersPerDay[sectionId as keyof typeof chaptersPerDay];
        
        if (progress.bookIndex < section.books.length) {
          const reading = this.generateSectionReading(section, progress, chapterCount);
          if (reading) {
            dayReading.sections[sectionId] = reading;
            dayReading.passages[sectionId] = reading;
          }
        }
      });

      readings.push(dayReading);
    }

    return readings;
  }

  private calculateSectionChapters(): Record<string, number> {
    const sectionChapters: Record<string, number> = {};
    
    BIBLE_SECTIONS.forEach(section => {
      let totalChapters = 0;
      section.books.forEach(bookName => {
        const book = BIBLE_BOOKS[bookName];
        if (book) {
          totalChapters += book.chapters;
        }
      });
      sectionChapters[section.id] = totalChapters;
    });
    
    return sectionChapters;
  }
  private generateSectionReading(
    section: ReadingSection, 
    progress: { bookIndex: number; chapter: number }, 
    targetChapters: number
  ) {
    const currentBook = section.books[progress.bookIndex];
    if (!currentBook) return null;

    const bookInfo = BIBLE_BOOKS[currentBook];
    if (!bookInfo) return null;

    const startChapter = progress.chapter;
    let endChapter = Math.min(startChapter + targetChapters - 1, bookInfo.chapters);
    
    // If we finish this book, move to next book
    if (endChapter >= bookInfo.chapters) {
      endChapter = bookInfo.chapters;
      progress.bookIndex++;
      progress.chapter = 1;
    } else {
      progress.chapter = endChapter + 1;
    }

    return {
      book: currentBook,
      startChapter,
      endChapter,
      reference: startChapter === endChapter 
        ? `${currentBook} ${startChapter}`
        : `${currentBook} ${startChapter}-${endChapter}`,
      completed: false
    };
  }

  generateCustomPlan(
    name: string,
    sections: string[],
    duration: number,
    startDate: Date
  ): ReadingPlan {
    const selectedSections = BIBLE_SECTIONS.filter(s => sections.includes(s.id));
    
    // Calculate total chapters for selected sections
    let totalChapters = 0;
    selectedSections.forEach(section => {
      section.books.forEach(bookName => {
        const book = BIBLE_BOOKS[bookName];
        if (book) {
          totalChapters += book.chapters;
        }
      });
    });

    const chaptersPerDay = Math.ceil(totalChapters / duration);
    const readings = this.generateCustomReadings(selectedSections, duration, startDate, chaptersPerDay);    return {
      id: `custom-plan-${Date.now()}`,
      name,
      description: `Custom reading plan: ${sections.join(', ')} in ${duration} days`,
      duration,
      startDate: format(startDate, 'yyyy-MM-dd'),
      sections: selectedSections.map(s => s.id) as BibleSection[],
      readings,
      progress: {
        totalDays: duration,
        completedDays: 0,
        currentDay: 1
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }
  private generateCustomReadings(
    sections: ReadingSection[],
    duration: number,
    startDate: Date,
    chaptersPerDay: number
  ): DailyReading[] {
    const readings: DailyReading[] = [];
    let currentSectionIndex = 0;
    let currentBookIndex = 0;
    let currentChapter = 1;    for (let day = 1; day <= duration; day++) {
      const currentDate = addDays(startDate, day - 1);
      const dayReading: DailyReading = {
        day,
        date: format(currentDate, 'yyyy-MM-dd'),
        passages: {},
        sections: {}
      };

      let chaptersAssigned = 0;
      while (chaptersAssigned < chaptersPerDay && currentSectionIndex < sections.length) {
        const section = sections[currentSectionIndex];
        const currentBook = section.books[currentBookIndex];
        
        if (!currentBook) {
          currentSectionIndex++;
          currentBookIndex = 0;
          currentChapter = 1;
          continue;
        }

        const bookInfo = BIBLE_BOOKS[currentBook];
        if (!bookInfo) {
          currentBookIndex++;
          continue;
        }

        const remainingChapters = chaptersPerDay - chaptersAssigned;
        const availableChapters = bookInfo.chapters - currentChapter + 1;
        const chaptersTake = Math.min(remainingChapters, availableChapters);

        const startChapter = currentChapter;
        const endChapter = currentChapter + chaptersTake - 1;        if (!dayReading.sections[section.id]) {
          const reading = {
            book: currentBook,
            startChapter,
            endChapter,
            reference: startChapter === endChapter 
              ? `${currentBook} ${startChapter}`
              : `${currentBook} ${startChapter}-${endChapter}`,
            completed: false
          };
          dayReading.sections[section.id] = reading;
          dayReading.passages[section.id] = reading;
        }

        chaptersAssigned += chaptersTake;
        currentChapter += chaptersTake;

        if (currentChapter > bookInfo.chapters) {
          currentBookIndex++;
          currentChapter = 1;
        }
      }

      readings.push(dayReading);
    }

    return readings;
  }
}

export const planGenerator = new ReadingPlanGenerator();

export const generateReadingPlan = (options: {
  name: string;
  duration: number;
  sections: string[];
  startDate: Date;
}) => {
  return planGenerator.generatePlan(options.name, options.duration, options.startDate);
};

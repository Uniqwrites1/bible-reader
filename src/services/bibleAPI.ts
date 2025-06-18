import type { BibleVersion, BiblePassage } from '../types';

// Using Bible API from api.bible (requires no authentication for public domain texts)
const BIBLE_API_BASE = 'https://api.bible/v1';

class BibleAPIService {
  private cache = new Map<string, any>();
  
  async getVersions(): Promise<BibleVersion[]> {
    // Return commonly available public domain Bible versions
    // In a production app, you would fetch these from an API
    return [
      { id: 'ESV', name: 'English Standard Version', abbreviation: 'ESV', language: 'en' },
      { id: 'NIV', name: 'New International Version', abbreviation: 'NIV', language: 'en' },
      { id: 'NLT', name: 'New Living Translation', abbreviation: 'NLT', language: 'en' },
      { id: 'NASB', name: 'New American Standard Bible', abbreviation: 'NASB', language: 'en' },
      { id: 'KJV', name: 'King James Version', abbreviation: 'KJV', language: 'en' },
      { id: 'WEB', name: 'World English Bible', abbreviation: 'WEB', language: 'en' }
    ];
  }

  async getPassage(
    version: string, 
    book: string, 
    startChapter: number, 
    endChapter: number,
    startVerse?: number,
    endVerse?: number
  ): Promise<BiblePassage | null> {
    try {
      let reference = `${book}.${startChapter}`;
      
      if (startVerse) {
        reference += `.${startVerse}`;
      }
      
      if (endChapter !== startChapter) {
        reference += `-${book}.${endChapter}`;
        if (endVerse) {
          reference += `.${endVerse}`;
        }
      } else if (endVerse && endVerse !== startVerse) {
        reference += `-${endVerse}`;
      }

      const cacheKey = `${version}-${reference}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${BIBLE_API_BASE}/api/${version}/${reference}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const passage: BiblePassage = {
        id: `${version}-${reference}`,
        reference: this.formatReference(book, startChapter, endChapter, startVerse, endVerse),
        content: data.text || '',
        verses: data.verses?.map((verse: any, index: number) => ({
          id: `${version}-${reference}-${index}`,
          reference: verse.verse || `${book} ${startChapter}:${(startVerse || 1) + index}`,
          content: verse.text || '',
          verseId: verse.verse_id || index + 1
        })) || []
      };

      this.cache.set(cacheKey, passage);
      return passage;
    } catch (error) {
      console.error('Error fetching Bible passage:', error);
      return null;
    }
  }

  async getChapter(version: string, book: string, chapter: number): Promise<BiblePassage | null> {
    return this.getPassage(version, book, chapter, chapter);
  }

  async getVerses(
    version: string, 
    book: string, 
    chapter: number, 
    startVerse: number, 
    endVerse: number
  ): Promise<BiblePassage | null> {
    return this.getPassage(version, book, chapter, chapter, startVerse, endVerse);
  }

  private formatReference(
    book: string, 
    startChapter: number, 
    endChapter: number, 
    startVerse?: number, 
    endVerse?: number
  ): string {
    let reference = book;
    
    if (startChapter === endChapter) {
      reference += ` ${startChapter}`;
      if (startVerse && endVerse) {
        if (startVerse === endVerse) {
          reference += `:${startVerse}`;
        } else {
          reference += `:${startVerse}-${endVerse}`;
        }
      } else if (startVerse) {
        reference += `:${startVerse}`;
      }
    } else {
      reference += ` ${startChapter}`;
      if (startVerse) {
        reference += `:${startVerse}`;
      }
      reference += ` - ${endChapter}`;
      if (endVerse) {
        reference += `:${endVerse}`;
      }
    }
    
    return reference;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const bibleAPI = new BibleAPIService();

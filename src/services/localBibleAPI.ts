import type { BibleVersion, BiblePassage, BibleVerse } from '../types';

interface LocalChapterData {
  translation: {
    id: string;
    name: string;
    abbreviation?: string;
    language: string;
  };
  book: {
    id: string;
    name: string;
    commonName: string;
  };
  chapter: {
    number: number;
    content: Array<{
      type: string;
      number?: number;
      content?: any;
    }>;
  };
}

class LocalBibleAPIService {
  private cache = new Map<string, any>();
  
  // Map local book names to API IDs for consistency
  private bookNameToId: { [key: string]: string } = {
    'Genesis': 'GEN',
    'Exodus': 'EXO',
    'Leviticus': 'LEV',
    'Numbers': 'NUM',
    'Deuteronomy': 'DEU',
    'Joshua': 'JOS',
    'Judges': 'JDG',
    'Ruth': 'RUT',
    '1 Samuel': '1SA',
    '2 Samuel': '2SA',
    '1 Kings': '1KI',
    '2 Kings': '2KI',
    '1 Chronicles': '1CH',
    '2 Chronicles': '2CH',
    'Ezra': 'EZR',
    'Nehemiah': 'NEH',
    'Esther': 'EST',
    'Job': 'JOB',
    'Psalms': 'PSA',
    'Proverbs': 'PRO',
    'Ecclesiastes': 'ECC',
    'Song of Songs': 'SNG',
    'Isaiah': 'ISA',
    'Jeremiah': 'JER',
    'Lamentations': 'LAM',
    'Ezekiel': 'EZK',
    'Daniel': 'DAN',
    'Hosea': 'HOS',
    'Joel': 'JOL',
    'Amos': 'AMO',
    'Obadiah': 'OBA',
    'Jonah': 'JON',
    'Micah': 'MIC',
    'Nahum': 'NAM',
    'Habakkuk': 'HAB',
    'Zephaniah': 'ZEP',
    'Haggai': 'HAG',
    'Zechariah': 'ZEC',
    'Malachi': 'MAL',
    'Matthew': 'MAT',
    'Mark': 'MRK',
    'Luke': 'LUK',
    'John': 'JHN',
    'Acts': 'ACT',
    'Romans': 'ROM',
    '1 Corinthians': '1CO',
    '2 Corinthians': '2CO',
    'Galatians': 'GAL',
    'Ephesians': 'EPH',
    'Philippians': 'PHP',
    'Colossians': 'COL',
    '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH',
    '1 Timothy': '1TI',
    '2 Timothy': '2TI',
    'Titus': 'TIT',
    'Philemon': 'PHM',
    'Hebrews': 'HEB',
    'James': 'JAS',
    '1 Peter': '1PE',
    '2 Peter': '2PE',
    '1 John': '1JN',
    '2 John': '2JN',
    '3 John': '3JN',
    'Jude': 'JUD',
    'Revelation': 'REV'
  };  async getVersions(): Promise<BibleVersion[]> {
    try {
      // Try to load available translations from JSON file first
      const response = await fetch('/api/available_translations.json');
      if (response.ok) {
        const translations = await response.json();
        if (translations && translations.length > 0) {
          // Make sure compatibility with old format while supporting new enhanced format
          return translations.map((translation: any) => ({
            id: translation.id,
            name: translation.name,
            abbreviation: translation.abbreviation,
            language: translation.language,
            translation_philosophy: translation.translation_philosophy,
            features: translation.features,
            availability: translation.availability,
            quality: translation.quality,
            metadata: translation.metadata
          }));
        }
      }
    } catch (error) {
      console.log('Could not load available_translations.json, falling back to hardcoded list');
    }

    // Fallback to a comprehensive list of available translations
    return [
      { id: 'BSB', name: 'Berean Standard Bible', abbreviation: 'BSB', language: 'en' },
      { id: 'eng_kjv', name: 'King James Version', abbreviation: 'KJV', language: 'en' },
      { id: 'eng_web', name: 'World English Bible', abbreviation: 'WEB', language: 'en' },
      { id: 'eng_asv', name: 'American Standard Version', abbreviation: 'ASV', language: 'en' },
      { id: 'eng_bbe', name: 'Bible in Basic English', abbreviation: 'BBE', language: 'en' },
      { id: 'eng_dby', name: 'Darby Bible', abbreviation: 'DBY', language: 'en' },
      { id: 'eng_ylt', name: 'Young\'s Literal Translation', abbreviation: 'YLT', language: 'en' },
      { id: 'spa_rvg', name: 'Reina Valera Gomez', abbreviation: 'RVG', language: 'es' },
      { id: 'fra_lsg', name: 'Louis Segond', abbreviation: 'LSG', language: 'fr' },
      { id: 'deu_sch', name: 'Schlachter Bibel', abbreviation: 'SCH', language: 'de' },
      { id: 'por_blt', name: 'Bíblia Livre', abbreviation: 'BLT', language: 'pt' },
      { id: 'rus_syn', name: 'Russian Synodal', abbreviation: 'SYN', language: 'ru' },
      { id: 'hin_cvb', name: 'Hindi Bible', abbreviation: 'CVB', language: 'hi' },
      { id: 'cmn_cuv', name: 'Chinese Union Version', abbreviation: 'CUV', language: 'zh' },
      { id: 'jpn_loc', name: 'Japanese Bible', abbreviation: 'LOC', language: 'ja' },
      { id: 'ara_nva', name: 'Arabic New Van Dyck', abbreviation: 'NVA', language: 'ar' },
      { id: 'swh_bib', name: 'Swahili Bible', abbreviation: 'SWH', language: 'sw' },
      { id: 'yor_ycb', name: 'Yoruba Contemporary Bible', abbreviation: 'YCB', language: 'yo' },
      { id: 'hau_bib', name: 'Hausa Bible', abbreviation: 'HAU', language: 'ha' },
      { id: 'ibo_bib', name: 'Igbo Bible', abbreviation: 'IBO', language: 'ig' }
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
      const cacheKey = `${version}-${book}-${startChapter}-${endChapter}-${startVerse || ''}-${endVerse || ''}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Get book ID from book name
      const bookId = this.bookNameToId[book];
      if (!bookId) {
        console.error(`Book ID not found for: ${book}`);
        return null;
      }

      // For now, only handle single chapter requests
      if (startChapter !== endChapter) {
        console.error('Multi-chapter passages not yet supported in local API');
        return null;
      }

      const chapterData = await this.loadChapterFromLocal(version, bookId, startChapter);
      if (!chapterData) {
        return null;
      }

      // Extract verses from the chapter content
      const verses = this.extractVersesFromChapter(chapterData, startVerse, endVerse);
      
      const passage: BiblePassage = {
        id: `${version}-${book}-${startChapter}`,
        reference: this.formatReference(book, startChapter, endChapter, startVerse, endVerse),
        content: verses.map(v => v.content).join(' '),
        verses: verses
      };

      this.cache.set(cacheKey, passage);
      return passage;
    } catch (error) {
      console.error('Error fetching local Bible passage:', error);
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

  private async loadChapterFromLocal(version: string, bookId: string, chapter: number): Promise<LocalChapterData | null> {
    try {
      // Construct path to local JSON file
      const chapterPath = `/api/${version}/${bookId}/${chapter}.json`;
      
      const response = await fetch(chapterPath);
      if (!response.ok) {
        console.error(`Failed to load chapter: ${chapterPath}`);
        return null;
      }

      const data: LocalChapterData = await response.json();
      return data;
    } catch (error) {
      console.error(`Error loading chapter from local file:`, error);
      return null;
    }
  }

  private extractVersesFromChapter(
    chapterData: LocalChapterData, 
    startVerse?: number, 
    endVerse?: number
  ): BibleVerse[] {
    const verses: BibleVerse[] = [];
    
    // Filter content to only verse entries
    const verseEntries = chapterData.chapter.content.filter(item => 
      item.type === 'verse' && item.number
    );

    for (const verseEntry of verseEntries) {
      const verseNumber = verseEntry.number!;
      
      // Apply verse range filtering if specified
      if (startVerse && verseNumber < startVerse) continue;
      if (endVerse && verseNumber > endVerse) continue;

      // Extract text content from the verse
      const verseText = this.extractTextFromContent(verseEntry.content);
      
      verses.push({
        id: `${chapterData.translation.id}-${chapterData.book.id}-${chapterData.chapter.number}-${verseNumber}`,
        reference: `${chapterData.book.commonName} ${chapterData.chapter.number}:${verseNumber}`,
        content: verseText,
        verseId: verseNumber
      });
    }

    return verses;
  }

  private extractTextFromContent(content: any): string {
    if (!content) return '';
    
    if (Array.isArray(content)) {
      return content.map(item => {
        if (typeof item === 'string') {
          return item;
        } else if (item && typeof item === 'object') {
          if (item.text) {
            return item.text;
          }
          // Skip note IDs and other metadata
          return '';
        }
        return '';
      }).filter(text => text.length > 0).join(' ');
    }
    
    if (typeof content === 'string') {
      return content;
    }
    
    return '';
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

export const localBibleAPI = new LocalBibleAPIService();

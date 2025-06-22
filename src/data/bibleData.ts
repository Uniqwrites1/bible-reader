import type { ReadingSection, BibleVersion } from '../types';
import { localBibleAPI } from '../services/localBibleAPI';

export const BIBLE_SECTIONS: ReadingSection[] = [
  {
    id: 'history',
    name: 'History',
    color: '#8B4513', // Saddle Brown
    books: [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther', 'Job'
    ]
  },
  {
    id: 'psalms',
    name: 'Psalms',
    color: '#FFD700', // Gold
    books: ['Psalms']
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    color: '#9370DB', // Medium Purple
    books: ['Proverbs', 'Ecclesiastes', 'Song of Songs']
  },
  {
    id: 'prophets',
    name: 'Prophets',
    color: '#DC143C', // Crimson
    books: [
      'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
      'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
      'Zechariah', 'Malachi'
    ]
  },
  {
    id: 'newTestament',
    name: 'New Testament',
    color: '#4169E1', // Royal Blue
    books: [
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
      'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude'
    ]
  },
  {
    id: 'revelation',
    name: 'Revelation',
    color: '#FF6347', // Tomato
    books: ['Revelation']
  }
];

export const BIBLE_BOOKS: { [bookName: string]: { chapters: number; id: string } } = {
  // Old Testament - History
  'Genesis': { chapters: 50, id: 'GEN' },
  'Exodus': { chapters: 40, id: 'EXO' },
  'Leviticus': { chapters: 27, id: 'LEV' },
  'Numbers': { chapters: 36, id: 'NUM' },
  'Deuteronomy': { chapters: 34, id: 'DEU' },
  'Joshua': { chapters: 24, id: 'JOS' },
  'Judges': { chapters: 21, id: 'JDG' },
  'Ruth': { chapters: 4, id: 'RUT' },
  '1 Samuel': { chapters: 31, id: '1SA' },
  '2 Samuel': { chapters: 24, id: '2SA' },
  '1 Kings': { chapters: 22, id: '1KI' },
  '2 Kings': { chapters: 25, id: '2KI' },
  '1 Chronicles': { chapters: 29, id: '1CH' },
  '2 Chronicles': { chapters: 36, id: '2CH' },
  'Ezra': { chapters: 10, id: 'EZR' },
  'Nehemiah': { chapters: 13, id: 'NEH' },
  'Esther': { chapters: 10, id: 'EST' },
  'Job': { chapters: 42, id: 'JOB' },
  
  // Psalms
  'Psalms': { chapters: 150, id: 'PSA' },
  
  // Wisdom
  'Proverbs': { chapters: 31, id: 'PRO' },
  'Ecclesiastes': { chapters: 12, id: 'ECC' },
  'Song of Songs': { chapters: 8, id: 'SNG' },
  
  // Prophets
  'Isaiah': { chapters: 66, id: 'ISA' },
  'Jeremiah': { chapters: 52, id: 'JER' },
  'Lamentations': { chapters: 5, id: 'LAM' },
  'Ezekiel': { chapters: 48, id: 'EZK' },
  'Daniel': { chapters: 12, id: 'DAN' },
  'Hosea': { chapters: 14, id: 'HOS' },
  'Joel': { chapters: 3, id: 'JOL' },
  'Amos': { chapters: 9, id: 'AMO' },
  'Obadiah': { chapters: 1, id: 'OBA' },
  'Jonah': { chapters: 4, id: 'JON' },
  'Micah': { chapters: 7, id: 'MIC' },
  'Nahum': { chapters: 3, id: 'NAM' },
  'Habakkuk': { chapters: 3, id: 'HAB' },
  'Zephaniah': { chapters: 3, id: 'ZEP' },
  'Haggai': { chapters: 2, id: 'HAG' },
  'Zechariah': { chapters: 14, id: 'ZEC' },
  'Malachi': { chapters: 4, id: 'MAL' },
  
  // New Testament
  'Matthew': { chapters: 28, id: 'MAT' },
  'Mark': { chapters: 16, id: 'MRK' },
  'Luke': { chapters: 24, id: 'LUK' },
  'John': { chapters: 21, id: 'JHN' },
  'Acts': { chapters: 28, id: 'ACT' },
  'Romans': { chapters: 16, id: 'ROM' },
  '1 Corinthians': { chapters: 16, id: '1CO' },
  '2 Corinthians': { chapters: 13, id: '2CO' },
  'Galatians': { chapters: 6, id: 'GAL' },
  'Ephesians': { chapters: 6, id: 'EPH' },
  'Philippians': { chapters: 4, id: 'PHP' },
  'Colossians': { chapters: 4, id: 'COL' },
  '1 Thessalonians': { chapters: 5, id: '1TH' },
  '2 Thessalonians': { chapters: 3, id: '2TH' },
  '1 Timothy': { chapters: 6, id: '1TI' },
  '2 Timothy': { chapters: 4, id: '2TI' },
  'Titus': { chapters: 3, id: 'TIT' },
  'Philemon': { chapters: 1, id: 'PHM' },
  'Hebrews': { chapters: 13, id: 'HEB' },
  'James': { chapters: 5, id: 'JAS' },
  '1 Peter': { chapters: 5, id: '1PE' },
  '2 Peter': { chapters: 3, id: '2PE' },
  '1 John': { chapters: 5, id: '1JN' },
  '2 John': { chapters: 1, id: '2JN' },
  '3 John': { chapters: 1, id: '3JN' },
  'Jude': { chapters: 1, id: 'JUD' },
  'Revelation': { chapters: 22, id: 'REV' }
};

export const BIBLE_VERSIONS = [
  { id: 'BSB', name: 'Berean Standard Bible', abbreviation: 'BSB' },
  { id: 'eng_kjv', name: 'King James Version', abbreviation: 'KJV' },
  { id: 'eng_web', name: 'World English Bible', abbreviation: 'WEB' },
  { id: 'eng_asv', name: 'American Standard Version', abbreviation: 'ASV' },
  { id: 'eng_bbe', name: 'Bible in Basic English', abbreviation: 'BBE' },
  { id: 'eng_dby', name: 'Darby Bible', abbreviation: 'DBY' },
  { id: 'eng_ylt', name: 'Young\'s Literal Translation', abbreviation: 'YLT' },
  { id: 'spa_rvg', name: 'Reina Valera Gomez', abbreviation: 'RVG' },
  { id: 'fra_lsg', name: 'Louis Segond', abbreviation: 'LSG' },
  { id: 'deu_sch', name: 'Schlachter Bibel', abbreviation: 'SCH' },
  { id: 'por_blt', name: 'Bíblia Livre', abbreviation: 'BLT' },
  { id: 'rus_syn', name: 'Russian Synodal', abbreviation: 'SYN' },
  { id: 'hin_cvb', name: 'Hindi Bible', abbreviation: 'CVB' },
  { id: 'cmn_cuv', name: 'Chinese Union Version', abbreviation: 'CUV' },
  { id: 'jpn_loc', name: 'Japanese Bible', abbreviation: 'LOC' },
  { id: 'swh_bib', name: 'Swahili Bible', abbreviation: 'SWH' },
  { id: 'yor_ycb', name: 'Yoruba Contemporary Bible', abbreviation: 'YCB' },
  { id: 'hau_bib', name: 'Hausa Bible', abbreviation: 'HAU' },
  { id: 'ibo_bib', name: 'Igbo Bible', abbreviation: 'IBO' }
];

// Method to get versions with enhanced metadata from API
export async function getBibleVersions(): Promise<BibleVersion[]> {
  try {
    return await localBibleAPI.getVersions();
  } catch (error) {
    console.error('Failed to load Bible versions from API:', error);
    // Return basic versions as fallback
    return BIBLE_VERSIONS.map(v => ({ 
      ...v, 
      language: v.id.includes('spa_') ? 'es' : 
                v.id.includes('fra_') ? 'fr' : 
                v.id.includes('deu_') ? 'de' : 
                v.id.includes('por_') ? 'pt' : 
                v.id.includes('rus_') ? 'ru' : 
                v.id.includes('hin_') ? 'hi' : 
                v.id.includes('cmn_') ? 'zh' : 
                v.id.includes('jpn_') ? 'ja' : 
                v.id.includes('swh_') ? 'sw' : 
                v.id.includes('yor_') ? 'yo' : 
                v.id.includes('hau_') ? 'ha' : 
                v.id.includes('ibo_') ? 'ig' : 'en'
    }));
  }
}

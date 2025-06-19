import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { localBibleAPI } from '../services/localBibleAPI';
import { BIBLE_VERSIONS, BIBLE_BOOKS } from '../data/bibleData';

// Convert BIBLE_BOOKS object to array format for easier iteration
const BIBLE_BOOKS_ARRAY = Object.entries(BIBLE_BOOKS).map(([name, data]) => ({
  name,
  chapters: data.chapters,
  id: data.id
}));
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  ArrowLeft,
  Type,
  Palette,
  Copy,
  Share2
} from 'lucide-react';

interface BibleText {
  book: string;
  chapter: number;
  verses: Array<{
    verse: number;
    text: string;
  }>;
}

const BibleReader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [bibleText, setBibleText] = useState<BibleText | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
    // Reading settings
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [selectedVersion, setSelectedVersion] = useState('eng_kjv');
  
  // Current passage
  const currentBook = searchParams.get('book') || 'Genesis';
  const currentChapter = parseInt(searchParams.get('chapter') || '1');
  const highlightVerse = parseInt(searchParams.get('verse') || '0');
    const bookInfo = BIBLE_BOOKS_ARRAY.find(book => book.name === currentBook);
  const maxChapter = bookInfo?.chapters || 1;
    const loadBibleText = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const text = await localBibleAPI.getChapter(selectedVersion, currentBook, currentChapter);
      if (text) {
        setBibleText({
          book: currentBook,
          chapter: currentChapter,
          verses: text.verses.map(v => ({
            verse: v.verseId,
            text: v.content
          }))
        });
      }
    } catch (err) {
      setError('Failed to load Bible text. Please try again.');
      console.error('Failed to load Bible text:', err);
    } finally {
      setLoading(false);
    }
  }, [currentBook, currentChapter, selectedVersion]);

  useEffect(() => {
    loadBibleText();
  }, [loadBibleText]);
  
  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentChapter > 1) {
      updateParams({ chapter: (currentChapter - 1).toString() });
    } else if (direction === 'next' && currentChapter < maxChapter) {
      updateParams({ chapter: (currentChapter + 1).toString() });    } else if (direction === 'prev' && currentChapter === 1) {
      // Navigate to previous book's last chapter
      const currentBookIndex = BIBLE_BOOKS_ARRAY.findIndex(book => book.name === currentBook);
      if (currentBookIndex > 0) {
        const prevBook = BIBLE_BOOKS_ARRAY[currentBookIndex - 1];
        updateParams({ 
          book: prevBook.name, 
          chapter: prevBook.chapters.toString(),
          verse: '1'
        });
      }    } else if (direction === 'next' && currentChapter === maxChapter) {
      // Navigate to next book's first chapter
      const currentBookIndex = BIBLE_BOOKS_ARRAY.findIndex(book => book.name === currentBook);
      if (currentBookIndex < BIBLE_BOOKS_ARRAY.length - 1) {
        const nextBook = BIBLE_BOOKS_ARRAY[currentBookIndex + 1];
        updateParams({ 
          book: nextBook.name, 
          chapter: '1',
          verse: '1'
        });
      }
    }
  };
  
  const updateParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    setSearchParams(newParams);
  };
  
  const handleVerseClick = (verseNumber: number) => {
    updateParams({ verse: verseNumber.toString() });
  };
  
  const copyVerse = (verse: { verse: number; text: string }) => {
    const reference = `${currentBook} ${currentChapter}:${verse.verse}`;
    const text = `"${verse.text}" - ${reference} (${selectedVersion})`;
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };
  
  const sharePassage = () => {
    const reference = `${currentBook} ${currentChapter}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `Bible Reading - ${reference}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      // Could add a toast notification here
    }
  };
  
  const fontFamilies = [
    { value: 'serif', name: 'Serif' },
    { value: 'sans-serif', name: 'Sans Serif' },
    { value: 'Georgia', name: 'Georgia' },
    { value: 'Times New Roman', name: 'Times' }
  ];

  return (
    <div className="bible-reader">
      <div className="reader-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft className="icon" />
          </button>
          <div className="passage-info">
            <h1>{currentBook} {currentChapter}</h1>
            <span className="version-badge">{selectedVersion}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={sharePassage} className="action-button">
            <Share2 className="icon" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="action-button"
          >
            <Settings className="icon" />
          </button>
        </div>
      </div>

      <div className="reader-content">
        <div className="chapter-navigation">
          <button 
            onClick={() => navigateChapter('prev')}
            disabled={currentChapter === 1 && BIBLE_BOOKS_ARRAY.findIndex(book => book.name === currentBook) === 0}
            className="nav-button"
          >
            <ChevronLeft className="icon" />
            Previous
          </button>
          
          <div className="chapter-selector">
            <select 
              value={currentBook}
              onChange={(e) => updateParams({ book: e.target.value, chapter: '1', verse: '1' })}
              className="book-select"
            >
              {BIBLE_BOOKS_ARRAY.map(book => (
                <option key={book.name} value={book.name}>
                  {book.name}
                </option>
              ))}
            </select>
            
            <select 
              value={currentChapter}
              onChange={(e) => updateParams({ chapter: e.target.value, verse: '1' })}
              className="chapter-select"
            >
              {Array.from({ length: maxChapter }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Chapter {i + 1}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => navigateChapter('next')}
            disabled={currentChapter === maxChapter && BIBLE_BOOKS_ARRAY.findIndex(book => book.name === currentBook) === BIBLE_BOOKS_ARRAY.length - 1}
            className="nav-button"
          >
            Next
            <ChevronRight className="icon" />
          </button>
        </div>

        {showSettings && (
          <div className="reader-settings">
            <div className="settings-group">
              <label>
                <Type className="icon" />
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="setting-slider"
              />
            </div>
            
            <div className="settings-group">
              <label>
                <Type className="icon" />
                Font Family
              </label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="setting-select"
              >
                {fontFamilies.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="settings-group">
              <label>
                <Palette className="icon" />
                Line Height: {lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="setting-slider"
              />
            </div>
            
            <div className="settings-group">
              <label>
                <BookOpen className="icon" />
                Bible Version
              </label>
              <select 
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="setting-select"
              >
                {BIBLE_VERSIONS.map(version => (
                  <option key={version.id} value={version.id}>
                    {version.name} ({version.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="bible-text-container">
          {loading && (
            <div className="loading-state">
              <BookOpen className="loading-icon" />
              <p>Loading Bible text...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Try Again
              </button>
            </div>
          )}
          
          {bibleText && (
            <div 
              className="bible-text"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                lineHeight: lineHeight
              }}
            >
              <div className="chapter-header">
                <h2>{bibleText.book} {bibleText.chapter}</h2>
              </div>
              
              <div className="verses">
                {bibleText.verses.map(verse => (
                  <div 
                    key={verse.verse}
                    className={`verse ${highlightVerse === verse.verse ? 'highlighted' : ''}`}
                    onClick={() => handleVerseClick(verse.verse)}
                  >
                    <span className="verse-number">{verse.verse}</span>
                    <span className="verse-text">{verse.text}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyVerse(verse);
                      }}
                      className="verse-action"
                      title="Copy verse"
                    >
                      <Copy className="icon" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BibleReader;

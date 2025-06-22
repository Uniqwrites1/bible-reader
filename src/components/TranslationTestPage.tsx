import React, { useState, useEffect } from 'react';
import { localBibleAPI } from '../services/localBibleAPI';
import type { BibleVersion } from '../types';

const TranslationTestPage: React.FC = () => {
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(null);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const loadedVersions = await localBibleAPI.getVersions();
        setVersions(loadedVersions);
        if (loadedVersions.length > 0) {
          setSelectedVersion(loadedVersions[0]);
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, []);

  if (loading) {
    return <div className="loading">Loading translations...</div>;
  }

  return (
    <div className="translation-test-page">
      <h1>Bible Translation Metadata Test</h1>
      
      <div className="version-selector">
        <h2>Available Translations</h2>
        <select 
          value={selectedVersion?.id || ''}
          onChange={(e) => {
            const version = versions.find(v => v.id === e.target.value);
            setSelectedVersion(version || null);
          }}
        >
          <option value="">Select a translation...</option>
          {versions.map(version => (
            <option key={version.id} value={version.id}>
              {version.name} ({version.abbreviation})
            </option>
          ))}
        </select>
      </div>

      {selectedVersion && (
        <div className="version-details-display">
          <h3>{selectedVersion.name}</h3>
          
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>ID:</strong> {selectedVersion.id}
            </div>
            <div className="metadata-item">
              <strong>Abbreviation:</strong> {selectedVersion.abbreviation}
            </div>
            <div className="metadata-item">
              <strong>Language:</strong> {selectedVersion.language}
            </div>
            
            {selectedVersion.translation_philosophy && (
              <div className="metadata-item full-width">
                <strong>Translation Philosophy:</strong>
                <p>{selectedVersion.translation_philosophy}</p>
              </div>
            )}
            
            {selectedVersion.features && selectedVersion.features.length > 0 && (
              <div className="metadata-item full-width">
                <strong>Features:</strong>
                <ul>
                  {selectedVersion.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedVersion.quality && (
              <div className="metadata-item">
                <strong>Quality:</strong>
                <div>Accuracy: {selectedVersion.quality.accuracy}</div>
                <div>Readability: {selectedVersion.quality.readability}</div>
              </div>
            )}
            
            {selectedVersion.availability && (
              <div className="metadata-item">
                <strong>Availability:</strong>
                <div>Format: {selectedVersion.availability.format}</div>
                <div>Status: {selectedVersion.availability.status}</div>
              </div>
            )}
            
            {selectedVersion.metadata && (
              <div className="metadata-item full-width">
                <strong>Publication Details:</strong>
                {selectedVersion.metadata.translator && (
                  <div>Translator: {selectedVersion.metadata.translator}</div>
                )}
                {selectedVersion.metadata.revision && (
                  <div>Revision: {selectedVersion.metadata.revision}</div>
                )}
                {selectedVersion.metadata.notes && (
                  <div>Notes: {selectedVersion.metadata.notes}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="json-display">
        <h3>Raw JSON Data</h3>
        <pre>{JSON.stringify(selectedVersion, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TranslationTestPage;

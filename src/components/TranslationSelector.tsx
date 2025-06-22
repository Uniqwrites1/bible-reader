import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { BibleVersion } from '../types';

interface TranslationSelectorProps {
  versions: BibleVersion[];
  selectedVersion: string;
  onVersionChange: (versionId: string) => void;
}

const TranslationSelector: React.FC<TranslationSelectorProps> = ({
  versions,
  selectedVersion,
  onVersionChange
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const currentVersion = versions.find(v => v.id === selectedVersion);

  const groupedVersions = versions.reduce((groups, version) => {
    const language = version.language || 'unknown';
    if (!groups[language]) {
      groups[language] = [];
    }
    groups[language].push(version);
    return groups;
  }, {} as Record<string, BibleVersion[]>);

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ru: 'Russian',
    hi: 'Hindi',
    zh: 'Chinese',
    ja: 'Japanese',
    ar: 'Arabic',
    sw: 'Swahili',
    yo: 'Yoruba',
    ha: 'Hausa',
    ig: 'Igbo'
  };

  return (
    <div className="translation-selector">
      <div className="selector-header">
        <label>Bible Translation</label>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="details-toggle"
        >
          <Info size={16} />
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        className="version-select"
      >
        {Object.entries(groupedVersions).map(([langCode, langVersions]) => (
          <optgroup key={langCode} label={languageNames[langCode] || langCode.toUpperCase()}>
            {langVersions.map(version => (
              <option key={version.id} value={version.id}>
                {version.name} ({version.abbreviation})
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {showDetails && currentVersion && (
        <div className="version-details">
          <div className="version-header">
            <h4>{currentVersion.name}</h4>
            <span className="version-abbr">{currentVersion.abbreviation}</span>
          </div>

          {currentVersion.translation_philosophy && (
            <div className="detail-section">
              <strong>Translation Philosophy:</strong>
              <p>{currentVersion.translation_philosophy}</p>
            </div>
          )}

          {currentVersion.features && currentVersion.features.length > 0 && (
            <div className="detail-section">
              <strong>Features:</strong>
              <ul>
                {currentVersion.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {currentVersion.quality && (
            <div className="detail-section">
              <strong>Quality Assessment:</strong>
              <div className="quality-metrics">
                <span className="quality-item">
                  <strong>Accuracy:</strong> {currentVersion.quality.accuracy}
                </span>
                <span className="quality-item">
                  <strong>Readability:</strong> {currentVersion.quality.readability}
                </span>
              </div>
            </div>
          )}

          {currentVersion.availability && (
            <div className="detail-section">
              <strong>Availability:</strong>
              <div className="availability-info">
                <span className="availability-item">
                  <strong>Format:</strong> {currentVersion.availability.format}
                </span>
                <span className="availability-item">
                  <strong>Status:</strong> {currentVersion.availability.status}
                </span>
              </div>
            </div>
          )}

          {currentVersion.metadata && (
            <div className="detail-section">
              <strong>Publication Details:</strong>
              {currentVersion.metadata.translator && (
                <p><strong>Translator:</strong> {currentVersion.metadata.translator}</p>
              )}
              {currentVersion.metadata.revision && (
                <p><strong>Revision:</strong> {currentVersion.metadata.revision}</p>
              )}
              {currentVersion.metadata.notes && (
                <p><strong>Notes:</strong> {currentVersion.metadata.notes}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Compact version info always visible */}
      {currentVersion && (
        <div className="version-summary">
          {currentVersion.translation_philosophy && (
            <small className="philosophy-summary">
              {currentVersion.translation_philosophy}
            </small>
          )}
          {currentVersion.quality && (
            <div className="quality-summary">
              <span className="quality-badge accuracy-{currentVersion.quality.accuracy.toLowerCase()}">
                {currentVersion.quality.accuracy} accuracy
              </span>
              <span className="quality-badge readability-{currentVersion.quality.readability.toLowerCase()}">
                {currentVersion.quality.readability} readability
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationSelector;

import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { storage } from '../services/storage';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Bell, 
  Palette, 
  BookOpen,
  Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [importing, setImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const handleExportData = async () => {
    try {
      const data = storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bible-study-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportStatus('Data exported successfully!');
      setTimeout(() => setExportStatus(null), 3000);    } catch (err) {
      setExportStatus('Failed to export data.');
      setTimeout(() => setExportStatus(null), 3000);
      console.error('Export error:', err);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {      const text = await file.text();
      const data = JSON.parse(text);
      storage.importData(data);
      
      // Refresh the app state
      window.location.reload();    } catch (err) {
      alert('Failed to import data. Please check the file format.');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };  const handleSettingChange = (key: string, value: string | number | boolean) => {
    const updatedSettings = {
      ...state.settings,
      [key]: value
    };
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: updatedSettings
    });
  };

  return (
    <div className="settings">
      <div className="container">
        <div className="settings-header">
          <h1><SettingsIcon className="icon" /> Settings</h1>
          <p>Customize your Bible study experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2><Palette className="section-icon" /> Appearance</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Theme</h3>
                <p>Choose your preferred color scheme</p>
              </div>
              <div className="setting-control">
                <select 
                  value={state.settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="setting-select"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Font Size</h3>
                <p>Adjust text size for comfortable reading</p>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={state.settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="setting-slider"
                />
                <span className="setting-value">{state.settings.fontSize}px</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Font Family</h3>
                <p>Select your preferred font for reading</p>
              </div>
              <div className="setting-control">
                <select 
                  value={state.settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="setting-select"
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2><BookOpen className="section-icon" /> Reading</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Default Bible Version</h3>
                <p>Choose your preferred Bible translation</p>
              </div>
              <div className="setting-control">
                <select 
                  value={state.settings.defaultVersion}
                  onChange={(e) => handleSettingChange('defaultVersion', e.target.value)}
                  className="setting-select"
                >
                  <option value="ESV">ESV</option>
                  <option value="NIV">NIV</option>
                  <option value="NLT">NLT</option>
                  <option value="NASB">NASB</option>
                  <option value="KJV">KJV</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Auto-mark as Read</h3>
                <p>Automatically mark passages as read when viewed</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={state.settings.autoMarkRead}
                    onChange={(e) => handleSettingChange('autoMarkRead', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Show Verse Numbers</h3>
                <p>Display verse numbers in Bible text</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={state.settings.showVerseNumbers}
                    onChange={(e) => handleSettingChange('showVerseNumbers', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2><Bell className="section-icon" /> Notifications</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Daily Reminders</h3>
                <p>Get notified about your daily reading</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={state.settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {state.settings.notifications && (
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Reminder Time</h3>
                  <p>When to send daily reading reminders</p>
                </div>
                <div className="setting-control">
                  <input
                    type="time"
                    value={state.settings.reminderTime}
                    onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                    className="setting-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h2><Download className="section-icon" /> Data Management</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Export Data</h3>
                <p>Download a backup of your reading plans and progress</p>
              </div>
              <div className="setting-control">
                <button onClick={handleExportData} className="btn btn-secondary">
                  <Download className="icon" /> Export
                </button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Import Data</h3>
                <p>Restore your data from a backup file</p>
              </div>
              <div className="setting-control">
                <label className="btn btn-secondary">
                  <Upload className="icon" /> 
                  {importing ? 'Importing...' : 'Import'}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    disabled={importing}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Clear All Data</h3>
                <p>Reset the app and remove all reading plans and progress</p>
              </div>
              <div className="setting-control">
                <button onClick={handleClearAllData} className="btn btn-danger">
                  <Trash2 className="icon" /> Clear All
                </button>
              </div>
            </div>

            {exportStatus && (
              <div className={`status-message ${exportStatus.includes('success') ? 'success' : 'error'}`}>
                {exportStatus}
              </div>
            )}
          </div>

          <div className="settings-section">
            <h2><Info className="section-icon" /> About</h2>
            
            <div className="setting-item">
              <div className="setting-info">
                <h3>Bible Study Plan App</h3>
                <p>Version 1.0.0</p>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Bible Text Source</h3>
                <p>Bible texts provided by bible.helloao.org</p>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Privacy</h3>
                <p>All data is stored locally on your device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { generateReadingPlan } from '../services/planGenerator';
import type { BibleSection } from '../types';
import { Calendar, BookOpen, Clock, Target, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const CreatePlan: React.FC = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState(365);
  const [selectedSections, setSelectedSections] = useState<BibleSection[]>([
    'history', 'psalms', 'wisdom', 'prophets', 'newTestament', 'revelation'
  ]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const sectionOptions = [
    { id: 'history' as BibleSection, name: 'History Books', description: 'Genesis through Esther' },
    { id: 'psalms' as BibleSection, name: 'Psalms', description: 'Book of Psalms' },
    { id: 'wisdom' as BibleSection, name: 'Wisdom Books', description: 'Proverbs, Ecclesiastes, Song of Songs' },
    { id: 'prophets' as BibleSection, name: 'Prophets', description: 'Isaiah through Malachi' },
    { id: 'newTestament' as BibleSection, name: 'New Testament', description: 'Matthew through Jude' },
    { id: 'revelation' as BibleSection, name: 'Revelation', description: 'Book of Revelation' }
  ];

  const presetDurations = [
    { days: 30, name: '1 Month', description: 'Quick overview' },
    { days: 90, name: '3 Months', description: 'Focused study' },
    { days: 180, name: '6 Months', description: 'Balanced pace' },
    { days: 365, name: '1 Year', description: 'Complete study' },
    { days: 730, name: '2 Years', description: 'Deep study' }
  ];

  const handleSectionToggle = (section: BibleSection) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCreatePlan = async () => {
    if (!planName.trim() || selectedSections.length === 0) return;

    try {
      const plan = generateReadingPlan({
        name: planName,
        duration,
        sections: selectedSections,
        startDate: new Date(startDate)
      });

      dispatch({ type: 'ADD_PLAN', payload: plan });
      navigate('/plans');
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Failed to create reading plan. Please try again.');
    }
  };

  const totalSteps = 4;

  return (
    <div className="create-plan">
      <div className="container">
        <div className="create-plan-header">
          <h1><BookOpen className="icon" /> Create Reading Plan</h1>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p>Step {currentStep} of {totalSteps}</p>
        </div>

        <div className="create-plan-content">
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-header">
                <Target className="step-icon" />
                <h2>Plan Details</h2>
                <p>Give your reading plan a name and set the duration</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="planName">Plan Name</label>
                <input
                  id="planName"
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., My Bible Reading Journey"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <div className="duration-presets">
                  {presetDurations.map(preset => (
                    <button
                      key={preset.days}
                      onClick={() => setDuration(preset.days)}
                      className={`preset-button ${duration === preset.days ? 'active' : ''}`}
                    >
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-description">{preset.description}</span>
                    </button>
                  ))}
                </div>
                
                <div className="custom-duration">
                  <label htmlFor="customDuration">Custom duration (days)</label>
                  <input
                    id="customDuration"
                    type="number"
                    min="30"
                    max="3650"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(30, parseInt(e.target.value) || 30))}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-header">
                <BookOpen className="step-icon" />
                <h2>Bible Sections</h2>
                <p>Choose which sections of the Bible to include in your plan</p>
              </div>
              
              <div className="sections-grid">
                {sectionOptions.map(section => (
                  <div
                    key={section.id}
                    onClick={() => handleSectionToggle(section.id)}
                    className={`section-card ${selectedSections.includes(section.id) ? 'selected' : ''}`}
                  >
                    <div className="section-checkbox">
                      {selectedSections.includes(section.id) && <CheckCircle className="check-icon" />}
                    </div>
                    <h3>{section.name}</h3>
                    <p>{section.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="selection-summary">
                <p>{selectedSections.length} sections selected</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <Calendar className="step-icon" />
                <h2>Start Date</h2>
                <p>When would you like to begin your reading plan?</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              
              <div className="date-preview">
                <div className="preview-card">
                  <h3>Plan Summary</h3>
                  <div className="summary-item">
                    <strong>Duration:</strong> {duration} days
                  </div>
                  <div className="summary-item">
                    <strong>Start:</strong> {new Date(startDate).toLocaleDateString()}
                  </div>
                  <div className="summary-item">
                    <strong>End:</strong> {new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  <div className="summary-item">
                    <strong>Sections:</strong> {selectedSections.length} selected
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-content">
              <div className="step-header">
                <CheckCircle className="step-icon" />
                <h2>Review & Create</h2>
                <p>Review your plan details and create your reading schedule</p>
              </div>
              
              <div className="plan-review">
                <div className="review-card">
                  <h3>"{planName}"</h3>
                  
                  <div className="review-details">
                    <div className="review-item">
                      <Clock className="review-icon" />
                      <span>{duration} days</span>
                    </div>
                    <div className="review-item">
                      <Calendar className="review-icon" />
                      <span>Starts {new Date(startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="review-item">
                      <BookOpen className="review-icon" />
                      <span>{selectedSections.length} sections</span>
                    </div>
                  </div>
                  
                  <div className="included-sections">
                    <h4>Included Sections:</h4>
                    <ul>
                      {selectedSections.map(sectionId => {
                        const section = sectionOptions.find(s => s.id === sectionId);
                        return <li key={sectionId}>{section?.name}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="step-navigation">
          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft className="icon" /> Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 1 && !planName.trim()) ||
                (currentStep === 2 && selectedSections.length === 0)
              }
              className="btn btn-primary"
            >
              Next <ArrowRight className="icon" />
            </button>
          ) : (
            <button 
              onClick={handleCreatePlan}
              disabled={!planName.trim() || selectedSections.length === 0}
              className="btn btn-primary"
            >
              Create Plan <CheckCircle className="icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;

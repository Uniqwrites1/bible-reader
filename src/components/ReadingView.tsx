import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { format, addDays, subDays, isToday, isBefore } from 'date-fns';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckCircle, 
  Circle,
  Eye,
  Target,
  Clock,
  Award
} from 'lucide-react';

interface PassageInfo {
  book: string;
  startChapter: number;
  startVerse?: number;
  endChapter: number;
  endVerse?: number;
}

const ReadingView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const plan = state.plans.find(p => p.id === planId);
  
  // Calculate dayNumber first before using it
  const planStartDate = plan ? new Date(plan.startDate) : new Date();
  const currentDateObj = new Date(currentDate);
  const dayNumber = Math.floor((currentDateObj.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const todayProgress = state.progress.find(p => p.planId === planId!)?.completedReadings.filter(r => 
    r.day === dayNumber
  ).reduce((acc, reading) => {
    acc[reading.sectionId] = true;
    return acc;
  }, {} as Record<string, boolean>) || {};
  
  useEffect(() => {
    if (!plan) {
      navigate('/plans');
    }
  }, [plan, navigate]);
  
  if (!plan) return null;
  
  const readings = plan.readings.find(r => r.date === currentDate);
  const canNavigatePrevious = currentDateObj > planStartDate;
  const canNavigateNext = dayNumber < plan.duration;
    const handleSectionComplete = (section: string, completed: boolean) => {
    if (completed) {
      dispatch({
        type: 'MARK_READING_COMPLETE',
        payload: {
          planId: plan.id,
          day: dayNumber,
          sectionId: section
        }
      });
    } else {
      dispatch({
        type: 'MARK_READING_INCOMPLETE',
        payload: {
          planId: plan.id,
          day: dayNumber,
          sectionId: section
        }
      });
    }
  };
  const handleReadPassage = (_section: string, passage: PassageInfo) => {
    navigate(`/bible-reader?book=${passage.book}&chapter=${passage.startChapter}&verse=${passage.startVerse || 1}`);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && canNavigatePrevious) {
      setCurrentDate(subDays(currentDateObj, 1).toISOString().split('T')[0]);
    } else if (direction === 'next' && canNavigateNext) {
      setCurrentDate(addDays(currentDateObj, 1).toISOString().split('T')[0]);
    }
  };

  const completedSections = readings ? Object.keys(readings.passages).filter(section => todayProgress[section]) : [];
  const totalSections = readings ? Object.keys(readings.passages).length : 0;
  const progressPercentage = totalSections > 0 ? (completedSections.length / totalSections) * 100 : 0;

  const getSectionColor = (section: string) => {
    const colors = {
      history: '#8B4513',
      psalms: '#4169E1',
      wisdom: '#DAA520',
      prophets: '#8A2BE2',
      newTestament: '#DC143C',
      revelation: '#FF4500'
    };
    return colors[section as keyof typeof colors] || '#666';
  };

  const formatPassage = (passage: PassageInfo) => {
    if (passage.startChapter === passage.endChapter) {
      // Same chapter
      if (passage.startVerse && passage.endVerse) {
        if (passage.startVerse === passage.endVerse) {
          return `${passage.book} ${passage.startChapter}:${passage.startVerse}`;
        }
        return `${passage.book} ${passage.startChapter}:${passage.startVerse}-${passage.endVerse}`;
      }
      return `${passage.book} ${passage.startChapter}`;
    } else {
      // Multiple chapters
      const start = passage.startVerse ? `${passage.startChapter}:${passage.startVerse}` : `${passage.startChapter}`;
      const end = passage.endVerse ? `${passage.endChapter}:${passage.endVerse}` : `${passage.endChapter}`;
      return `${passage.book} ${start}-${end}`;
    }
  };

  return (
    <div className="reading-view">
      <div className="container">
        <div className="reading-header">
          <div className="plan-info">
            <h1><BookOpen className="icon" /> {plan.name}</h1>
            <p>Day {dayNumber} of {plan.duration}</p>
          </div>
          
          <div className="date-navigation">
            <button 
              onClick={() => navigateDate('prev')}
              disabled={!canNavigatePrevious}
              className="nav-button"
            >
              <ChevronLeft className="icon" />
            </button>
            
            <div className="current-date">
              <Calendar className="icon" />
              <span>{format(currentDateObj, 'MMMM d, yyyy')}</span>
              {isToday(currentDateObj) && <span className="today-badge">Today</span>}
            </div>
            
            <button 
              onClick={() => navigateDate('next')}
              disabled={!canNavigateNext}
              className="nav-button"
            >
              <ChevronRight className="icon" />
            </button>
          </div>
        </div>

        {readings ? (
          <>
            <div className="daily-progress">
              <div className="progress-header">
                <h2>Today's Progress</h2>
                <div className="progress-stats">
                  <span>{completedSections.length} of {totalSections} completed</span>
                  <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="readings-list">
              <h2>Today's Readings</h2>
              
              {Object.entries(readings.passages).map(([section, passages]) => {
                const isCompleted = todayProgress[section];
                const sectionColor = getSectionColor(section);
                
                return (
                  <div 
                    key={section} 
                    className={`reading-section ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="section-header">
                      <div className="section-info">
                        <div 
                          className="section-indicator"
                          style={{ backgroundColor: sectionColor }}
                        />
                        <h3>{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                        <span className="passage-count">
                          {Array.isArray(passages) ? passages.length : 1} passage{Array.isArray(passages) && passages.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleSectionComplete(section, !isCompleted)}
                        className={`completion-button ${isCompleted ? 'completed' : ''}`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="icon" />
                        ) : (
                          <Circle className="icon" />
                        )}
                      </button>
                    </div>
                    
                    <div className="passages-list">
                      {(Array.isArray(passages) ? passages : [passages]).map((passage, index) => (
                        <div key={index} className="passage-item">
                          <div className="passage-info">
                            <span className="passage-reference">
                              {formatPassage(passage)}
                            </span>
                            {passage.description && (
                              <span className="passage-description">
                                {passage.description}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleReadPassage(section, passage)}
                            className="read-button"
                          >
                            <Eye className="icon" /> Read
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {progressPercentage === 100 && (
              <div className="completion-celebration">
                <Award className="celebration-icon" />
                <h3>Day Complete! 🎉</h3>
                <p>Great job completing today's reading. Keep up the excellent work!</p>
              </div>
            )}
          </>
        ) : (
          <div className="no-reading">
            <div className="no-reading-content">
              {dayNumber > plan.duration ? (
                <>
                  <Award className="icon" />
                  <h2>Plan Complete!</h2>
                  <p>Congratulations on completing your Bible reading plan!</p>
                </>
              ) : isBefore(currentDateObj, planStartDate) ? (
                <>
                  <Clock className="icon" />
                  <h2>Plan Hasn't Started Yet</h2>
                  <p>Your reading plan begins on {format(planStartDate, 'MMMM d, yyyy')}</p>
                </>
              ) : (
                <>
                  <Target className="icon" />
                  <h2>No Reading Scheduled</h2>
                  <p>There's no reading scheduled for this date.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingView;

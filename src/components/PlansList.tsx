import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { format } from 'date-fns';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Play, 
  Trash2, 
  Download,
  Share2,
  Plus,
  Target,
  CheckCircle
} from 'lucide-react';

const PlansList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const calculateProgress = (planId: string) => {
    const progress = state.progress.find(p => p.planId === planId);
    if (!progress) return 0;
    
    const plan = state.plans.find(p => p.id === planId);
    if (!plan) return 0;
    
    const totalReadings = plan.duration;
    const completedReadings = progress.completedReadings.length;
    
    return totalReadings > 0 ? (completedReadings / totalReadings) * 100 : 0;
  };
  const getNextReading = (planId: string) => {
    const plan = state.plans.find(p => p.id === planId);
    const progress = state.progress.find(p => p.planId === planId);
    
    if (!plan || !progress) return null;
    
    const today = new Date();
    const planStartDate = new Date(plan.startDate);
    const daysSinceStart = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(Math.max(daysSinceStart, 1), plan.duration);
    
    // Check if current day's readings are completed
    const completedForDay = progress.completedReadings.filter(r => r.day === currentDay);
    const totalSectionsForDay = plan.readings.find(r => r.day === currentDay)?.sections ? 
      Object.keys(plan.readings.find(r => r.day === currentDay)!.sections).length : 0;
    
    if (completedForDay.length < totalSectionsForDay) {
      return today.toISOString().split('T')[0];
    }
    
    return null;
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this reading plan? This action cannot be undone.')) {
      dispatch({ type: 'DELETE_PLAN', payload: planId });
    }
    setActiveDropdown(null);
  };

  const handleExportPlan = (planId: string) => {
    // Implementation would go here
    console.log('Export plan:', planId);
    setActiveDropdown(null);
  };

  const handleSharePlan = (planId: string) => {
    // Implementation would go here
    console.log('Share plan:', planId);
    setActiveDropdown(null);
  };

  if (state.plans.length === 0) {
    return (
      <div className="plans-list empty-state">
        <div className="container">
          <div className="empty-content">
            <BookOpen className="empty-icon" />
            <h2>No Reading Plans Yet</h2>
            <p>Create your first Bible reading plan to begin your journey through Scripture.</p>
            <button 
              onClick={() => navigate('/create-plan')}
              className="btn btn-primary"
            >
              <Plus className="icon" /> Create First Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-list">
      <div className="container">
        <div className="plans-header">
          <div className="header-content">
            <h1><BookOpen className="icon" /> My Reading Plans</h1>
            <p>Manage and track your Bible reading journey</p>
          </div>
          <button 
            onClick={() => navigate('/create-plan')}
            className="btn btn-primary"
          >
            <Plus className="icon" /> New Plan
          </button>
        </div>

        <div className="plans-grid">
          {state.plans.map(plan => {
            const progress = calculateProgress(plan.id);
            const nextReading = getNextReading(plan.id);
            const isActive = nextReading !== null;
            
            return (
              <div key={plan.id} className={`plan-card ${!isActive ? 'completed' : ''}`}>
                <div className="plan-header">
                  <div className="plan-title">
                    <h3>{plan.name}</h3>
                    <div className="plan-meta">
                      <span className="meta-item">
                        <Clock className="meta-icon" />
                        {plan.duration} days
                      </span>
                      <span className="meta-item">
                        <Calendar className="meta-icon" />
                        Started {format(new Date(plan.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="plan-actions">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === plan.id ? null : plan.id)}
                      className="action-button"
                    >
                      <MoreVertical className="icon" />
                    </button>
                    
                    {activeDropdown === plan.id && (
                      <div className="dropdown-menu">
                        <button onClick={() => handleExportPlan(plan.id)}>
                          <Download className="icon" /> Export
                        </button>
                        <button onClick={() => handleSharePlan(plan.id)}>
                          <Share2 className="icon" /> Share
                        </button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="danger">
                          <Trash2 className="icon" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="plan-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="plan-sections">
                  <div className="sections-header">
                    <span>Sections</span>
                    <span>{plan.sections.length} included</span>
                  </div>
                  <div className="sections-list">
                    {plan.sections.map(section => (
                      <span key={section} className={`section-tag section-${section}`}>
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="plan-status">
                  {isActive ? (
                    <>
                      {nextReading === new Date().toISOString().split('T')[0] ? (
                        <div className="status-item current">
                          <Target className="status-icon" />
                          <span>Today's reading available</span>
                        </div>
                      ) : (
                        <div className="status-item pending">
                          <Clock className="status-icon" />
                          <span>Next: {format(new Date(nextReading!), 'MMM d')}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="status-item completed">
                      <CheckCircle className="status-icon" />
                      <span>Plan completed!</span>
                    </div>
                  )}
                </div>

                <div className="plan-actions-primary">
                  {isActive ? (
                    <button 
                      onClick={() => navigate(`/reading/${plan.id}`)}
                      className="btn btn-primary"
                    >
                      <Play className="icon" /> Continue Reading
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/reading/${plan.id}`)}
                      className="btn btn-secondary"
                    >
                      <BookOpen className="icon" /> Review Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlansList;

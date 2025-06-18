import React from 'react';
import { Calendar, BookOpen, CheckCircle, Target, Clock, Plus, List } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, setCurrentPlan, isReadingComplete } = useApp();
  const { plans, currentPlan } = state;

  const getProgressStats = () => {
    if (!currentPlan) return null;

    const today = new Date();
    const planStartDate = new Date(currentPlan.startDate);
    const daysSinceStart = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(Math.max(daysSinceStart, 1), currentPlan.duration);
    
    const todaysReading = currentPlan.readings.find((r) => r.day === currentDay);
    
    let completedToday = 0;
    let totalToday = 0;
    
    if (todaysReading) {
      totalToday = Object.keys(todaysReading.sections).length;
      completedToday = Object.keys(todaysReading.sections).filter(sectionId =>
        isReadingComplete(currentPlan.id, currentDay, sectionId)
      ).length;
    }    const totalCompleted = currentPlan.readings.reduce((total: number, reading) => {
      const dayCompleted = Object.keys(reading.sections).filter(sectionId =>
        isReadingComplete(currentPlan.id, reading.day, sectionId)
      ).length;
      return total + dayCompleted;
    }, 0);

    const totalReadings = currentPlan.readings.reduce((total: number, reading) => {
      return total + Object.keys(reading.sections).length;
    }, 0);

    return {
      currentDay,
      completedToday,
      totalToday,
      totalCompleted,
      totalReadings,
      overallProgress: (totalCompleted / totalReadings) * 100
    };
  };

  const stats = getProgressStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          📖 Bible Study Plan App
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Read through the entire Bible with flexible, personalized plans that make your spiritual journey both manageable and meaningful.
        </p>
        
        {!currentPlan && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/create-plan')}
              className="btn btn-primary btn-lg"
            >
              <Plus className="h-5 w-5" />
              Create Your First Plan
            </button>            <button
              onClick={() => navigate('/plans')}
              className="btn btn-secondary btn-lg"
            >
              <List className="h-5 w-5" />
              Browse Plans
            </button>
          </div>
        )}
      </div>

      {/* Current Plan Section */}
      {currentPlan && stats && (
        <div className="mb-12">
          <div className="card max-w-4xl mx-auto">
            <div className="card-header">
              <h2 className="card-title">📚 {currentPlan.name}</h2>
              <p className="card-subtitle">{currentPlan.description}</p>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  Day {stats.currentDay}
                </div>
                <p className="text-gray-400">of {currentPlan.duration} days</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {stats.completedToday}/{stats.totalToday}
                </div>
                <p className="text-gray-400">Today's readings</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {Math.round(stats.overallProgress)}%
                </div>
                <p className="text-gray-400">Overall progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{stats.totalCompleted} / {stats.totalReadings} readings</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${stats.overallProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">              <button
                onClick={() => navigate(`/reading/${currentPlan.id}`)}
                className="btn btn-primary flex-1"
              >
                <BookOpen className="h-4 w-4" />
                Continue Reading
              </button>              <button
                onClick={() => navigate('/plans')}
                className="btn btn-secondary"
              >
                <Calendar className="h-4 w-4" />
                View Plan Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why You'll Love This App</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card text-center">
            <Calendar className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Flexible Plans</h3>
            <p className="text-gray-300">
              Choose your timeline from 30 days to a full year. Create custom plans that fit your schedule.
            </p>
          </div>

          <div className="card text-center">
            <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Complete Coverage</h3>
            <p className="text-gray-300">
              Balanced daily readings from History, Psalms, Wisdom, Prophets, New Testament, and Revelation.
            </p>
          </div>

          <div className="card text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
            <p className="text-gray-300">
              Visual progress tracking with completion checkboxes and beautiful progress bars.
            </p>
          </div>

          <div className="card text-center">
            <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Stay Motivated</h3>
            <p className="text-gray-300">
              Never lose your place with automatic progress saving and milestone celebrations.
            </p>
          </div>

          <div className="card text-center">
            <Clock className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Read Directly</h3>
            <p className="text-gray-300">
              Click any reading to access multiple Bible versions with adjustable font sizes.
            </p>
          </div>          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-3">Export & Share</h3>
            <p className="text-gray-300">
              Print your plan, export to PDF/CSV, or share with family and small groups.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Plans */}
      {plans.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Reading Plans</h2>
            <button
                          onClick={() => navigate('/plans')}
              className="btn btn-ghost"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.slice(0, 3).map((plan) => (
              <div key={plan.id} className="card">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{plan.duration} days</span>
                  <span>Started {format(new Date(plan.startDate), 'MMM d, yyyy')}</span>
                </div>

                <div className="flex gap-2">                  <button
                    onClick={() => {
                      setCurrentPlan(plan);
                      navigate(`/reading/${plan.id}`);
                    }}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPlan(plan);
                      navigate('/plans');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {plans.length === 0 && (
        <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Bible Reading Journey?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of believers who have successfully read through the entire Bible using our structured, 
            flexible reading plans. Start your spiritual growth today!
          </p>          <button
            onClick={() => navigate('/create-plan')}
            className="btn btn-primary btn-lg"
          >
            <Plus className="h-5 w-5" />
            Create Your First Plan Now
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;

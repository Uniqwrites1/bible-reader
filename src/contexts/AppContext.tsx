import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ReadingPlan, ReadingProgress, AppSettings } from '../types';
import { storage } from '../services/storage';

interface AppState {
  plans: ReadingPlan[];
  currentPlan: ReadingPlan | null;
  progress: ReadingProgress[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { plans: ReadingPlan[]; progress: ReadingProgress[]; settings: AppSettings } }
  | { type: 'ADD_PLAN'; payload: ReadingPlan }
  | { type: 'UPDATE_PLAN'; payload: ReadingPlan }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'SET_CURRENT_PLAN'; payload: ReadingPlan | null }
  | { type: 'UPDATE_PROGRESS'; payload: ReadingProgress }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'MARK_READING_COMPLETE'; payload: { planId: string; day: number; sectionId: string } }
  | { type: 'MARK_READING_INCOMPLETE'; payload: { planId: string; day: number; sectionId: string } };

const initialState: AppState = {
  plans: [],
  currentPlan: null,
  progress: [],
  settings: {
    fontSize: 'medium',
    bibleVersion: 'YLT',
    darkMode: true,
    autoAdvance: false,
    theme: 'dark',
    fontFamily: 'serif',
    defaultVersion: 'ESV',
    autoMarkRead: false,
    showVerseNumbers: true,
    notifications: false,
    reminderTime: '08:00'
  },
  loading: true,
  error: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'LOAD_DATA':
      return {
        ...state,
        plans: action.payload.plans,
        progress: action.payload.progress,
        settings: action.payload.settings,
        loading: false
      };
    
    case 'ADD_PLAN':
      storage.savePlan(action.payload);
      return {
        ...state,
        plans: [...state.plans, action.payload]
      };
    
    case 'UPDATE_PLAN':
      storage.savePlan(action.payload);
      return {
        ...state,
        plans: state.plans.map(plan => 
          plan.id === action.payload.id ? action.payload : plan
        ),
        currentPlan: state.currentPlan?.id === action.payload.id ? action.payload : state.currentPlan
      };
    
    case 'DELETE_PLAN':
      storage.deletePlan(action.payload);
      return {
        ...state,
        plans: state.plans.filter(plan => plan.id !== action.payload),
        currentPlan: state.currentPlan?.id === action.payload ? null : state.currentPlan,
        progress: state.progress.filter(p => p.planId !== action.payload)
      };
    
    case 'SET_CURRENT_PLAN':
      return { ...state, currentPlan: action.payload };
    
    case 'UPDATE_PROGRESS':
      storage.saveProgress(action.payload);
      return {
        ...state,
        progress: state.progress.map(p => 
          p.planId === action.payload.planId ? action.payload : p
        ).concat(
          state.progress.find(p => p.planId === action.payload.planId) ? [] : [action.payload]
        )
      };
    
    case 'UPDATE_SETTINGS':
      storage.saveSettings(action.payload);
      return { ...state, settings: action.payload };
      case 'MARK_READING_COMPLETE': {
      storage.markReadingComplete(action.payload.planId, action.payload.day, action.payload.sectionId);
      const existingProgress = state.progress.find(p => p.planId === action.payload.planId);
      const newCompleteReading = {
        day: action.payload.day,
        sectionId: action.payload.sectionId,
        completedAt: new Date().toISOString()
      };
      
      if (existingProgress) {
        const updatedProgress = {
          ...existingProgress,
          completedReadings: [...existingProgress.completedReadings, newCompleteReading]
        };
        return {
          ...state,
          progress: state.progress.map(p => 
            p.planId === action.payload.planId ? updatedProgress : p
          )
        };
      } else {
        const newProgress = {
          planId: action.payload.planId,
          completedReadings: [newCompleteReading]
        };        return {
          ...state,
          progress: [...state.progress, newProgress]
        };
      }
    }
    
    case 'MARK_READING_INCOMPLETE':
      storage.markReadingIncomplete(action.payload.planId, action.payload.day, action.payload.sectionId);
      return {
        ...state,
        progress: state.progress.map(p => 
          p.planId === action.payload.planId 
            ? {
                ...p,
                completedReadings: p.completedReadings.filter(r => 
                  !(r.day === action.payload.day && r.sectionId === action.payload.sectionId)
                )
              }
            : p
        )
      };
    
    default:
      return state;
  }
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addPlan: (plan: ReadingPlan) => void;
  updatePlan: (plan: ReadingPlan) => void;
  deletePlan: (planId: string) => void;
  setCurrentPlan: (plan: ReadingPlan | null) => void;
  updateProgress: (progress: ReadingProgress) => void;
  updateSettings: (settings: AppSettings) => void;
  markReadingComplete: (planId: string, day: number, sectionId: string) => void;
  markReadingIncomplete: (planId: string, day: number, sectionId: string) => void;
  isReadingComplete: (planId: string, day: number, sectionId: string) => boolean;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Load data on app start
    const loadData = async () => {
      try {
        const plans = storage.getAllPlans();
        const progress = storage.getAllProgress();
        const settings = storage.getSettings();
        
        dispatch({
          type: 'LOAD_DATA',
          payload: { plans, progress, settings }
        });
      } catch (error) {
        console.error('Error loading app data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load app data' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  const addPlan = (plan: ReadingPlan) => {
    dispatch({ type: 'ADD_PLAN', payload: plan });
  };

  const updatePlan = (plan: ReadingPlan) => {
    dispatch({ type: 'UPDATE_PLAN', payload: plan });
  };

  const deletePlan = (planId: string) => {
    dispatch({ type: 'DELETE_PLAN', payload: planId });
  };

  const setCurrentPlan = (plan: ReadingPlan | null) => {
    dispatch({ type: 'SET_CURRENT_PLAN', payload: plan });
  };

  const updateProgress = (progress: ReadingProgress) => {
    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  };

  const updateSettings = (settings: AppSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const markReadingComplete = (planId: string, day: number, sectionId: string) => {
    dispatch({ type: 'MARK_READING_COMPLETE', payload: { planId, day, sectionId } });
  };

  const markReadingIncomplete = (planId: string, day: number, sectionId: string) => {
    dispatch({ type: 'MARK_READING_INCOMPLETE', payload: { planId, day, sectionId } });
  };

  const isReadingComplete = (planId: string, day: number, sectionId: string): boolean => {
    const progress = state.progress.find(p => p.planId === planId);
    if (!progress) return false;
    
    return progress.completedReadings.some(
      r => r.day === day && r.sectionId === sectionId
    );
  };

  const exportData = (): string => {
    return storage.exportData();
  };

  const importData = (jsonData: string): boolean => {
    const success = storage.importData(jsonData);
    if (success) {
      // Reload data after import
      const plans = storage.getAllPlans();
      const progress = storage.getAllProgress();
      const settings = storage.getSettings();
      
      dispatch({
        type: 'LOAD_DATA',
        payload: { plans, progress, settings }
      });
    }
    return success;
  };
  const contextValue: AppContextValue = {
    state,
    dispatch,
    addPlan,
    updatePlan,
    deletePlan,
    setCurrentPlan,
    updateProgress,
    updateSettings,
    markReadingComplete,
    markReadingIncomplete,
    isReadingComplete,
    exportData,
    importData
  };  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

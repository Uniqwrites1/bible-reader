import type { ReadingPlan, ReadingProgress, AppSettings, UserProfile } from '../types';

class StorageService {
  private readonly STORAGE_KEYS = {
    PLANS: 'biblePlans',
    PROGRESS: 'bibleProgress',
    SETTINGS: 'bibleSettings',
    USER_PROFILE: 'userProfile'
  };

  // Reading Plans
  savePlan(plan: ReadingPlan): void {
    const plans = this.getAllPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    
    if (existingIndex >= 0) {
      plans[existingIndex] = { ...plan, updated: new Date().toISOString() };
    } else {
      plans.push(plan);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }

  getAllPlans(): ReadingPlan[] {
    try {
      const plans = localStorage.getItem(this.STORAGE_KEYS.PLANS);
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('Error loading plans:', error);
      return [];
    }
  }

  getPlan(planId: string): ReadingPlan | null {
    const plans = this.getAllPlans();
    return plans.find(p => p.id === planId) || null;
  }

  deletePlan(planId: string): void {
    const plans = this.getAllPlans();
    const filteredPlans = plans.filter(p => p.id !== planId);
    localStorage.setItem(this.STORAGE_KEYS.PLANS, JSON.stringify(filteredPlans));
    
    // Also remove progress for this plan
    this.deleteProgress(planId);
  }

  // Reading Progress
  saveProgress(progress: ReadingProgress): void {
    const allProgress = this.getAllProgress();
    const existingIndex = allProgress.findIndex(p => p.planId === progress.planId);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
  }

  getProgress(planId: string): ReadingProgress | null {
    const allProgress = this.getAllProgress();
    return allProgress.find(p => p.planId === planId) || null;
  }

  getAllProgress(): ReadingProgress[] {
    try {
      const progress = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
      return progress ? JSON.parse(progress) : [];
    } catch (error) {
      console.error('Error loading progress:', error);
      return [];
    }
  }

  deleteProgress(planId: string): void {
    const allProgress = this.getAllProgress();
    const filteredProgress = allProgress.filter(p => p.planId !== planId);
    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(filteredProgress));
  }

  markReadingComplete(planId: string, day: number, sectionId: string): void {
    const progress = this.getProgress(planId) || {
      planId,
      completedReadings: []
    };

    const existingReading = progress.completedReadings.find(
      r => r.day === day && r.sectionId === sectionId
    );

    if (!existingReading) {
      progress.completedReadings.push({
        day,
        sectionId,
        completedAt: new Date().toISOString()
      });
      
      this.saveProgress(progress);
    }
  }

  markReadingIncomplete(planId: string, day: number, sectionId: string): void {
    const progress = this.getProgress(planId);
    if (!progress) return;

    progress.completedReadings = progress.completedReadings.filter(
      r => !(r.day === day && r.sectionId === sectionId)
    );
    
    this.saveProgress(progress);
  }

  isReadingComplete(planId: string, day: number, sectionId: string): boolean {
    const progress = this.getProgress(planId);
    if (!progress) return false;

    return progress.completedReadings.some(
      r => r.day === day && r.sectionId === sectionId
    );
  }

  // App Settings
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getSettings(): AppSettings {
    try {
      const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }
  private getDefaultSettings(): AppSettings {
    return {
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
    };
  }

  // User Profile
  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  getUserProfile(): UserProfile | null {
    try {
      const profile = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Export/Import
  exportData(): string {
    const data = {
      plans: this.getAllPlans(),
      progress: this.getAllProgress(),
      settings: this.getSettings(),
      userProfile: this.getUserProfile(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.plans) {
        localStorage.setItem(this.STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
      }
      
      if (data.progress) {
        localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      }
      
      if (data.settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      if (data.userProfile) {
        localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
  });
  }
}

export const storage = new StorageService();

import { registerSW } from 'virtual:pwa-register';

// Register service worker with immediate activation
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh');
    // Immediately update
    updateSW();
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  immediate: true,
  onRegistered(registration) {
    console.log('Service worker registered:', registration);
  },
  onRegisterError(error) {
    console.error('Service worker registration failed:', error);
  }
});

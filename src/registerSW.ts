import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  immediate: true
});

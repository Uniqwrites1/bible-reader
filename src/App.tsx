import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CreatePlan from './components/CreatePlan';
import PlansList from './components/PlansList';
import ReadingView from './components/ReadingView';
import BibleReader from './components/BibleReader';
import Settings from './components/Settings';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/plans" element={<PlansList />} />
              <Route path="/reading/:planId" element={<ReadingView />} />
              <Route path="/bible-reader" element={<BibleReader />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <PWAInstallPrompt />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

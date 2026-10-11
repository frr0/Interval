import { useState } from 'react';
import { ActivityModal } from './components/ActivityModal';
import { LoginView } from './components/LoginView';
import { Navbar, NavTab } from './components/Navbar';
import { ActivitiesView } from './components/views/ActivitiesView';
import { CalendarView } from './components/views/CalendarView';
import { DashboardView } from './components/views/DashboardView';
import { FitnessView } from './components/views/FitnessView';
import { ProfileView } from './components/views/ProfileView';
import { AppProvider, useApp } from './context/AppContext';
import { Activity } from './types/intervals';

function MainApp() {
  const { credentials, isLoading, useImperial } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080A0F]">
        <div className="w-8 h-8 border-3 border-[#00E5A3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!credentials) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#080A0F] text-white flex flex-col font-sans selection:bg-[#00E5A3]/20 selection:text-[#00E5A3]">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectActivity={setSelectedActivity}
            onNavigateTab={setCurrentTab}
          />
        )}
        {currentTab === 'fitness' && <FitnessView />}
        {currentTab === 'activities' && (
          <ActivitiesView onSelectActivity={setSelectedActivity} />
        )}
        {currentTab === 'plan' && <CalendarView />}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Activity Details Modal */}
      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        useImperial={useImperial}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

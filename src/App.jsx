import React, { useState, useEffect } from 'react';
import TimeTracker from './components/TimeTracker';
import Profile from './components/Profile';
import Todo from './components/Todo';

function App() {
  // 1. Check localStorage on load. If nothing is saved, default to 'tracker'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('myhub_active_tab') || 'tracker';
  });

  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('myhub_profile_stats');
    return savedStats ? JSON.parse(savedStats) : { totalPhp: 0, totalSeconds: 0, lastUpdated: 'Never', history: [] };
  });

  // 2. Save the activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('myhub_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('myhub_profile_stats', JSON.stringify(stats));
  }, [stats]);

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-mint">
      {/* Top Branding */}
      <div className="p-6 text-center lg:text-left max-w-6xl mx-auto w-full">
        <h2 className="text-chocolate font-black uppercase text-sm tracking-[0.3em]">Rene's Personal Hub</h2>
      </div>

      <main className="flex-1">
        {activeTab === 'tracker' && <TimeTracker setGlobalStats={setStats} />}
        {activeTab === 'todo' && <Todo />}
        {activeTab === 'profile' && <Profile stats={stats} />}
      </main>

      {/* Floating Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border-4 border-chocolate rounded-full px-6 py-3 flex gap-8 shadow-[8px_8px_0px_0px_#4E342E] z-50">
        <button 
          onClick={() => setActiveTab('tracker')} 
          className={`text-xl cursor-pointer transition-all hover:scale-110 ${activeTab === 'tracker' ? 'opacity-100 scale-125' : 'opacity-30 grayscale'}`}
          title="Tracker"
        >
          ⏰
        </button>
        <button 
          onClick={() => setActiveTab('todo')} 
          className={`text-xl cursor-pointer transition-all hover:scale-110 ${activeTab === 'todo' ? 'opacity-100 scale-125' : 'opacity-30 grayscale'}`}
          title="To-do List"
        >
          📝
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`text-xl cursor-pointer transition-all hover:scale-110 ${activeTab === 'profile' ? 'opacity-100 scale-125' : 'opacity-30 grayscale'}`}
          title="Profile"
        >
          👤
        </button>
      </nav>
    </div>
  );
}

export default App;
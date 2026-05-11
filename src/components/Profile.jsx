import React, { useState } from 'react';

const Profile = ({ stats }) => {
  const [showResetPopup, setShowResetPopup] = useState(false);
  const formatHours = (secs) => (secs / 3600).toFixed(1);

  const todayDate = new Date().toLocaleDateString();
  const dailyLogs = stats.history ? stats.history.filter(log => log.date === todayDate) : [];

  const handleFullReset = () => {
    localStorage.removeItem('myhub_profile_stats');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-in fade-in duration-500">
      
      {/* CUSTOM RESET POPUP */}
      {showResetPopup && (
        <div className="fixed inset-0 bg-chocolate/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-chocolate rounded-card p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_#4E342E] text-center">
            <h2 className="text-2xl font-black text-chocolate uppercase mb-2">Wipe All Data?</h2>
            <p className="text-sm text-chocolate/60 font-bold mb-6">This will permanently delete your career totals and daily history. This cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetPopup(false)} 
                className="flex-1 py-3 border-4 border-chocolate rounded-button font-black uppercase text-xs cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleFullReset} 
                className="flex-1 py-3 bg-strawberry border-4 border-chocolate rounded-button font-black uppercase text-xs shadow-[4px_4px_0px_0px_#4E342E] cursor-pointer hover:opacity-90 transition-opacity"
              >
                Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-chocolate rounded-card shadow-[12px_12px_0px_0px_#FFD1DC] overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-strawberry p-8 border-b-4 border-chocolate flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white border-4 border-chocolate rounded-full flex items-center justify-center text-4xl shadow-[6px_6px_0px_0px_#4E342E] mb-4">
            IT
          </div>
          <h1 className="text-3xl font-black text-chocolate uppercase tracking-tighter">Rene's Time-In History</h1>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lifetime Earnings Card */}
            <div className="bg-mint border-4 border-chocolate rounded-3xl p-6 shadow-[6px_6px_0px_0px_#4E342E]">
              <p className="text-[10px] font-black text-chocolate/50 uppercase tracking-widest mb-1 text-center">Total Accumulated Earnings</p>
              <div className="text-5xl font-black text-chocolate tracking-tight text-center">
                ₱{stats.totalPhp.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Lifetime Hours Card */}
            <div className="bg-honey border-4 border-chocolate rounded-3xl p-6 shadow-[6px_6px_0px_0px_#4E342E]">
              <p className="text-[10px] font-black text-chocolate/50 uppercase tracking-widest mb-1 text-center">Total Career Hours</p>
              <div className="text-5xl font-black text-chocolate tracking-tight text-center">
                {formatHours(stats.totalSeconds)} <span className="text-xl">HRS</span>
              </div>
            </div>
          </div>

          {/* DAILY BREAKDOWN SECTION */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b-4 border-chocolate pb-2">
              <h3 className="font-black text-chocolate uppercase text-sm tracking-widest">Today's Sessions ({todayDate})</h3>
              <span className="bg-chocolate text-white text-[10px] font-bold px-2 py-1 rounded">
                {dailyLogs.length} LOGS
              </span>
            </div>

            {dailyLogs.length === 0 ? (
              <div className="py-10 text-center border-4 border-dashed border-chocolate/10 rounded-2xl">
                <p className="text-chocolate/20 font-black uppercase tracking-tighter text-xl">No Sessions Today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyLogs.map((log, index) => (
                  <div key={index} className="bg-white border-2 border-chocolate p-4 rounded-2xl flex justify-between items-center shadow-[4px_4px_0px_0px_#4E342E]">
                    <div>
                      <p className="text-[10px] font-black text-chocolate/40 uppercase leading-none">{log.timeLabel}</p>
                      <p className="font-bold text-chocolate text-sm mt-1">Daily Log #{dailyLogs.length - index}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-chocolate leading-none">₱{log.amount.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-chocolate bg-mint border-2 border-chocolate px-2 py-0.5 rounded-full inline-block mt-1">
                        {log.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="border-t-4 border-dashed border-mint pt-6 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-chocolate/40 uppercase tracking-widest">System Status</p>
              <div className="flex flex-col">
                <span className="font-bold text-chocolate text-xs">
                  Last Update: <span className="font-black">{stats.lastUpdated}</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowResetPopup(true)}
              className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase transition-colors cursor-pointer"
            >
              Wipe History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
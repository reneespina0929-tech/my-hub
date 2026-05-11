import React, { useState, useEffect, useRef } from 'react';

const TimeTracker = ({ setGlobalStats }) => {
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('myhub_work_logs') || '[]'));
  const [isRunning, setIsRunning] = useState(localStorage.getItem('myhub_is_running') === 'true');
  const [isPaused, setIsPaused] = useState(localStorage.getItem('myhub_is_paused') === 'true');
  const [seconds, setSeconds] = useState(parseInt(localStorage.getItem('myhub_seconds') || '0', 10));
  const [startTime, setStartTime] = useState(localStorage.getItem('myhub_start_time') || null);
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  
  const [showFinalizePopup, setShowFinalizePopup] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [usdToPhp, setUsdToPhp] = useState(60.99);

  // Core reference for the timer to prevent "stuck" resumes
  const secondsRef = useRef(seconds);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD').then(res => res.json()).then(data => {
      if (data.rates?.PHP) setUsdToPhp(data.rates.PHP);
    });
  }, []);

  // 1. REFRESH SYNC: Runs once on mount
  useEffect(() => {
    const lastTimestamp = localStorage.getItem('myhub_last_timestamp');
    if (isRunning && !isPaused && lastTimestamp) {
      const diff = Math.floor((Date.now() - parseInt(lastTimestamp, 10)) / 1000);
      if (diff > 0) {
        const newTotal = seconds + diff;
        setSeconds(newTotal);
        secondsRef.current = newTotal;
      }
    }

    const handleBeforeUnload = () => {
      if (isRunning && !isPaused) {
        localStorage.setItem('myhub_last_timestamp', Date.now().toString());
        localStorage.setItem('myhub_seconds', secondsRef.current.toString());
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 2. THE TIMER: Reliable 1-second heartbeat
  useEffect(() => {
    let interval = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);
    } else {
      // When paused or stopped, ensure local storage matches current ref
      localStorage.setItem('myhub_seconds', secondsRef.current.toString());
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // 3. PERSISTENCE
  useEffect(() => {
    localStorage.setItem('myhub_work_logs', JSON.stringify(logs));
    localStorage.setItem('myhub_is_running', isRunning);
    localStorage.setItem('myhub_is_paused', isPaused);
    if (startTime) localStorage.setItem('myhub_start_time', startTime);
  }, [logs, isRunning, isPaused, startTime]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const finalSeconds = secondsRef.current;
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      start: startTime,
      end: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: formatTime(finalSeconds),
      earned: parseFloat(((finalSeconds / 3600) * 10 * usdToPhp).toFixed(2)),
      rawSeconds: finalSeconds
    };
    setLogs([newLog, ...logs]);
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    secondsRef.current = 0;
    setStartTime(null);
    localStorage.removeItem('myhub_last_timestamp');
    localStorage.setItem('myhub_seconds', '0');
  };

  const finalizeLogs = () => {
    const selectedLogs = logs.filter(log => selectedLogIds.includes(log.id));
    const totalSelSecs = selectedLogs.reduce((sum, log) => sum + log.rawSeconds, 0);
    const totalSelPhp = selectedLogs.reduce((sum, log) => sum + log.earned, 0);
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const transactionRecord = {
      date: new Date().toLocaleDateString(),
      timeLabel: currentTime,
      amount: totalSelPhp,
      duration: `${Math.floor(totalSelSecs / 3600)}h ${Math.floor((totalSelSecs % 3600) / 60)}m`
    };

    setGlobalStats(prev => ({
      ...prev,
      totalPhp: prev.totalPhp + totalSelPhp,
      totalSeconds: prev.totalSeconds + totalSelSecs,
      lastAmount: totalSelPhp,
      lastUpdated: new Date().toLocaleDateString() + ' ' + currentTime,
      history: [transactionRecord, ...(prev.history || [])]
    }));

    setLogs(logs.filter(log => !selectedLogIds.includes(log.id)));
    setSelectedLogIds([]);
    setShowFinalizePopup(false);
  };

  const totalSelPhp = logs.filter(log => selectedLogIds.includes(log.id)).reduce((sum, log) => sum + log.earned, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 relative">
      {/* Popups... */}
      {showResetPopup && (
        <div className="fixed inset-0 bg-chocolate/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-chocolate rounded-card p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_#4E342E] text-center">
            <h2 className="text-2xl font-black text-chocolate uppercase mb-2">Discard?</h2>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowResetPopup(false)} className="flex-1 py-3 border-4 border-chocolate rounded-button font-black uppercase text-xs">Back</button>
              <button onClick={() => { setIsRunning(false); setIsPaused(false); setSeconds(0); secondsRef.current = 0; setStartTime(null); setShowResetPopup(false); }} className="flex-1 py-3 bg-strawberry border-4 border-chocolate rounded-button font-black uppercase text-xs shadow-[4px_4px_0px_0px_#4E342E]">Discard</button>
            </div>
          </div>
        </div>
      )}

      {showFinalizePopup && (
        <div className="fixed inset-0 bg-chocolate/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-chocolate rounded-card p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_#4E342E] text-center">
            <h2 className="text-2xl font-black text-chocolate uppercase mb-2">Cash Out?</h2>
            <p className="text-sm text-chocolate/60 font-bold mb-6">Add ₱{totalSelPhp.toFixed(2)} to totals?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowFinalizePopup(false)} className="flex-1 py-3 border-4 border-chocolate rounded-button font-black uppercase text-xs">Wait</button>
              <button onClick={finalizeLogs} className="flex-1 py-3 bg-mint border-4 border-chocolate rounded-button font-black uppercase text-xs shadow-[4px_4px_0px_0px_#4E342E]">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white border-4 border-chocolate rounded-card shadow-[10px_10px_0px_0px_#FFD1DC] sticky top-8">
          <div className="bg-strawberry p-4 border-b-4 border-chocolate flex justify-between items-center px-6">
            <h2 className="font-black uppercase text-chocolate tracking-widest text-sm">Active Session</h2>
            <span className="text-sm font-black text-chocolate">₱{usdToPhp.toFixed(2)}</span>
          </div>
          <div className="p-10 space-y-6 text-center">
            <h1 className="text-7xl font-black text-chocolate tabular-nums">{formatTime(seconds)}</h1>
            <div className="bg-mint border-4 border-chocolate rounded-3xl p-5 shadow-[6px_6px_0px_0px_#4E342E]">
              <div className="text-4xl font-black text-chocolate">₱{((seconds / 3600) * 10 * usdToPhp).toFixed(2)}</div>
            </div>
            <div className="flex gap-3">
              {!isRunning ? (
                <button onClick={() => { setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); setIsRunning(true); setIsPaused(false); }} className="flex-1 py-4 bg-strawberry border-4 border-chocolate rounded-button font-black text-xl shadow-[4px_4px_0px_0px_#4E342E]">START</button>
              ) : (
                <>
                  <button onClick={() => setShowResetPopup(true)} className="px-6 py-4 bg-white border-4 border-chocolate rounded-button font-black text-xl shadow-[4px_4px_0px_0px_#4E342E]">✕</button>
                  <button onClick={() => setIsPaused(!isPaused)} className={`flex-1 py-4 border-4 border-chocolate rounded-button font-black text-xl shadow-[4px_4px_0px_0px_#4E342E] ${isPaused ? 'bg-mint' : 'bg-honey'}`}>{isPaused ? 'RESUME' : 'PAUSE'}</button>
                  <button onClick={handleFinish} className="flex-1 py-4 bg-white border-4 border-chocolate rounded-button font-black text-xl shadow-[4px_4px_0px_0px_#4E342E]">FINISH</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end px-2 min-h-[80px]">
            <h3 className="text-chocolate font-black uppercase text-sm tracking-widest px-2">History</h3>
            {selectedLogIds.length > 0 && (
              <button onClick={() => setShowFinalizePopup(true)} className="bg-honey border-4 border-chocolate px-6 py-3 rounded-2xl shadow-[6px_6px_0px_0px_#4E342E] flex flex-col items-end">
                <p className="text-[10px] font-black text-chocolate opacity-50 uppercase">Finalize Selected</p>
                <p className="text-xl font-black text-chocolate">₱{totalSelPhp.toFixed(2)}</p>
              </button>
            )}
          </div>
          {/* Log Map logic remains unchanged... */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} onClick={() => setSelectedLogIds(prev => prev.includes(log.id) ? prev.filter(i => i !== log.id) : [...prev, log.id])} className={`cursor-pointer transition-all border-4 border-chocolate rounded-2xl p-4 flex justify-between items-center ${selectedLogIds.includes(log.id) ? 'bg-honey translate-x-2' : 'bg-white shadow-[6px_6px_0px_0px_#E0FFF0]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 border-chocolate rounded-md flex items-center justify-center ${selectedLogIds.includes(log.id) ? 'bg-chocolate' : 'bg-white'}`}>
                    {selectedLogIds.includes(log.id) && <div className="w-2 h-2 bg-white rounded-full"/>}
                  </div>
                  <div>
                    <p className="font-bold text-chocolate text-sm mt-1">{log.start} - {log.end}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-chocolate">₱{log.earned.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-chocolate bg-mint border-2 border-chocolate px-2 py-0.5 rounded-full inline-block">{log.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
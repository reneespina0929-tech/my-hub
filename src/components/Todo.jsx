import React, { useState, useEffect } from 'react';

const Todo = () => {
  // --- PERSISTENCE LOGIC ---
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('myhub_todos') || '[]'));
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('General');
  const [filter, setFilter] = useState('All');
  
  // Popup States
  const [showClearAllPopup, setShowClearAllPopup] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const categories = ['General', 'School', 'Work', 'Personal'];

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem('myhub_todos', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: input,
      category: category,
      status: 'Pending', 
      createdAt: new Date().toLocaleDateString()
    };
    
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const statusOrder = ['Pending', 'In Progress', 'Completed'];
        const nextStatus = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length];
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter(task => task.status !== 'Completed'));
    setShowClearAllPopup(false);
  };

  const getTaskStyles = (status) => {
    switch (status) {
      case 'In Progress': 
        return { card: 'bg-honey/20 border-honey', badge: 'bg-honey text-chocolate', check: 'bg-honey' };
      case 'Completed': 
        return { card: 'bg-mint/10 border-mint', badge: 'bg-mint text-chocolate', check: 'bg-mint' };
      default: 
        return { card: 'bg-white border-chocolate', badge: 'bg-chocolate text-white', check: 'bg-white' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* POPUP: CLEAR ALL COMPLETED */}
      {showClearAllPopup && (
        <div className="fixed inset-0 bg-chocolate/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-chocolate rounded-card p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_#4E342E] text-center">
            <h2 className="text-2xl font-black text-chocolate uppercase mb-2">Clear History?</h2>
            <p className="text-sm text-chocolate/60 font-bold mb-6">Remove all "Completed" tasks?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearAllPopup(false)} className="flex-1 py-3 border-4 border-chocolate rounded-button font-black uppercase text-xs cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleClearCompleted} className="flex-1 py-3 bg-strawberry border-4 border-chocolate rounded-button font-black uppercase text-xs shadow-[4px_4px_0px_0px_#4E342E] cursor-pointer hover:opacity-90">Clear Done</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: DELETE SINGLE TASK */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-chocolate/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-chocolate rounded-card p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_#4E342E] text-center">
            <h2 className="text-2xl font-black text-chocolate uppercase mb-2">Delete Task?</h2>
            <p className="text-sm text-chocolate/60 font-bold mb-6">Are you sure you want to remove "{taskToDelete.text}"?</p>
            <div className="flex gap-3">
              <button onClick={() => setTaskToDelete(null)} className="flex-1 py-3 border-4 border-chocolate rounded-button font-black uppercase text-xs cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-strawberry border-4 border-chocolate rounded-button font-black uppercase text-xs shadow-[4px_4px_0px_0px_#4E342E] cursor-pointer hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-chocolate rounded-card shadow-[12px_12px_0px_0px_#4E342E] overflow-hidden">
        <div className="bg-mint p-6 border-b-4 border-chocolate flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-chocolate uppercase tracking-tighter">Task Manager</h1>
            <p className="text-[10px] font-bold text-chocolate/60 uppercase tracking-widest mt-1">Organize your IT workflow</p>
          </div>
          <button onClick={() => setShowClearAllPopup(true)} className="text-[10px] font-black text-chocolate border-2 border-chocolate px-3 py-2 rounded-full hover:bg-strawberry/20 cursor-pointer uppercase">Clear Done</button>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          <form onSubmit={addTask} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" className="flex-1 border-4 border-chocolate rounded-2xl px-6 py-4 font-bold text-chocolate focus:outline-none" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border-4 border-chocolate rounded-2xl px-4 py-4 font-black text-chocolate uppercase text-xs cursor-pointer bg-white appearance-none">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <button type="submit" className="bg-strawberry border-4 border-chocolate rounded-2xl px-8 py-4 font-black text-chocolate uppercase shadow-[4px_4px_0px_0px_#4E342E] cursor-pointer hover:translate-y-1 hover:shadow-none transition-all">Add</button>
            </div>
          </form>

          {/* Filters: Solid Chocolate BG + White Text */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 border-4 border-chocolate rounded-full font-black text-[11px] uppercase cursor-pointer whitespace-nowrap transition-all outline-none
                  ${filter === f 
                    ? 'bg-[#4E342E] text-white' 
                    : 'bg-white text-[#4E342E] hover:bg-mint/30'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-4 min-h-[300px]">
            {tasks.length === 0 ? (
              <div className="py-20 text-center border-4 border-dashed border-chocolate/10 rounded-3xl">
                <p className="text-chocolate/20 font-black uppercase text-xl">No Tasks Found</p>
              </div>
            ) : (
              tasks.map(task => {
                const styles = getTaskStyles(task.status);
                const isFilteredOut = filter !== 'All' && task.status !== filter;
                const isCompleted = task.status === 'Completed';

                return (
                  <div 
                    key={task.id}
                    className={`group border-4 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-[6px_6px_0px_0px_#4E342E] 
                      ${styles.card} 
                      ${isFilteredOut || isCompleted ? 'opacity-30 grayscale scale-[0.98]' : 'hover:-translate-y-1'}`}
                  >
                    <div className="flex items-start gap-4">
                      <button onClick={() => toggleStatus(task.id)} className={`mt-1 w-7 h-7 border-4 border-chocolate rounded-md flex-shrink-0 cursor-pointer flex items-center justify-center ${styles.check}`}>
                        {isCompleted && <span className="text-chocolate font-black text-lg">✓</span>}
                        {task.status === 'In Progress' && <div className="w-2 h-2 bg-chocolate rounded-full animate-pulse" />}
                      </button>
                      <div>
                        <p className={`font-bold text-chocolate text-lg leading-tight ${isCompleted ? 'line-through' : ''}`}>{task.text}</p>
                        <div className="flex gap-2 mt-2">
                          {/* Correctly Centered Badges */}
                          <span className="h-6 px-3 bg-chocolate text-white text-[9px] font-black uppercase rounded flex items-center justify-center">
                            {task.category}
                          </span>
                          <span className={`h-6 px-3 border-2 border-chocolate text-[9px] font-black uppercase rounded flex items-center justify-center ${styles.badge}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                      <button onClick={() => toggleStatus(task.id)} className="text-[10px] font-black text-chocolate/40 uppercase hover:text-chocolate cursor-pointer">Cycle Status</button>
                      <button onClick={() => setTaskToDelete(task)} className="w-10 h-10 border-2 border-chocolate rounded-xl flex items-center justify-center bg-white hover:bg-strawberry/20 text-red-500 cursor-pointer">✕</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
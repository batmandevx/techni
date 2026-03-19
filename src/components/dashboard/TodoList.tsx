import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, MoreVertical, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
}

const defaultTasks: Task[] = [
  { id: '1', title: 'Review Q2 forecast accuracy', isCompleted: false, priority: 'High', dueDate: 'Today' },
  { id: '2', title: 'Approve new inventory restocking', isCompleted: false, priority: 'Medium', dueDate: 'Tomorrow' },
  { id: '3', title: 'Upload latest sales data batch', isCompleted: true, priority: 'Low', dueDate: 'Yesterday' },
];

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  useEffect(() => {
    const saved = localStorage.getItem('tenchi_tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tenchi_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      isCompleted: false,
      priority: 'Medium',
      dueDate: 'Today'
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className="card-modern" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Action Items</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending tasks and follow-ups</p>
        </div>
        <div style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
          {tasks.filter(t => !t.isCompleted).length} Pending
        </div>
      </div>

      <form onSubmit={addTask} style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="input-modern"
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
        />
        <button type="submit" className="btn-modern btn-primary-modern" style={{ padding: '0 14px', borderRadius: '12px' }} disabled={!newTaskTitle.trim()}>
          <Plus size={18} />
        </button>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="hover-lift"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 14px', 
              background: task.isCompleted ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.5)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.3s',
              opacity: task.isCompleted ? 0.7 : 1
            }}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
            >
              {task.isCompleted 
                ? <CheckCircle2 size={22} style={{ color: '#10b981' }} /> 
                : <Circle size={22} style={{ color: '#64748b' }} />
              }
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: task.isCompleted ? '#94a3b8' : '#f8fafc',
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                transition: 'all 0.3s'
              }}>
                {task.title}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                  <Clock size={12} /> {task.dueDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: getPriorityColor(task.priority) }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: getPriorityColor(task.priority) }} />
                  {task.priority}
                </span>
              </div>
            </div>
            <button 
              onClick={() => removeTask(task.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '6px', color: '#64748b', borderRadius: '8px' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
            <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 12px', opacity: 0.5 }} />
            All caught up! No pending tasks.
          </div>
        )}
      </div>
    </div>
  );
}

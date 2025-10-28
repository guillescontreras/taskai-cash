import React, { useState, useEffect } from 'react';
import { config } from '../config';

interface Task {
  taskId: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'completed' | 'expired';
  category: string;
  createdAt: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock tasks - replace with real API call
    setTimeout(() => {
      setTasks([
        {
          taskId: '1',
          title: 'Complete Daily Survey',
          description: 'Answer 10 questions about your shopping preferences',
          reward: 50,
          status: 'pending',
          category: 'surveys',
          createdAt: new Date().toISOString(),
        },
        {
          taskId: '2',
          title: 'Watch Product Video',
          description: 'Watch a 2-minute video about eco-friendly products',
          reward: 25,
          status: 'completed',
          category: 'videos',
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.taskId === taskId 
        ? { ...task, status: 'completed' as const }
        : task
    ));
  };

  if (loading) {
    return <div className="loading">Cargando tareas...</div>;
  }

  return (
    <div className="task-list">
      <h2>📋 Mis Tareas</h2>
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tienes tareas disponibles</p>
          <p>¡Genera nuevas tareas con IA!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task.taskId} className={`task-card ${task.status}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className="task-reward">${task.reward}</span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-footer">
                <span className="task-category">#{task.category}</span>
                {task.status === 'pending' && (
                  <button 
                    onClick={() => completeTask(task.taskId)}
                    className="complete-btn"
                  >
                    Completar
                  </button>
                )}
                {task.status === 'completed' && (
                  <span className="completed-badge">✅ Completada</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
import React, { useState } from 'react';
import { config } from '../config';

interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  reward: number;
  estimatedTime: string;
}

const AITaskGenerator: React.FC = () => {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('mixed');

  const generateTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API.baseURL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category === 'mixed' ? undefined : category,
          difficulty: difficulty === 'mixed' ? undefined : difficulty,
        }),
      });

      const data = await response.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = (task: GeneratedTask) => {
    // Mock adding task - replace with real API call
    console.log('Adding task:', task);
    alert(`Tarea "${task.title}" agregada a tu lista!`);
  };

  return (
    <div className="ai-generator">
      <h2>🤖 Generar Tareas con IA</h2>
      
      <div className="generator-controls">
        <div className="control-group">
          <label>Categoría:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="mixed">Mixta</option>
            <option value="surveys">Encuestas</option>
            <option value="videos">Videos</option>
            <option value="apps">Apps</option>
            <option value="social">Social Media</option>
            <option value="reviews">Reseñas</option>
          </select>
        </div>

        <div className="control-group">
          <label>Dificultad:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="mixed">Mixta</option>
            <option value="easy">Fácil (≤$50)</option>
            <option value="medium">Media ($51-$100)</option>
            <option value="hard">Difícil (&gt;$100)</option>
          </select>
        </div>

        <button 
          onClick={generateTasks} 
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generando...' : '✨ Generar Tareas'}
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="generated-tasks">
          <h3>Tareas Generadas:</h3>
          <div className="tasks-grid">
            {tasks.map((task, index) => (
              <div key={index} className="generated-task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className="task-reward">${task.reward}</span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span className="task-category">#{task.category}</span>
                  <span className="task-time">⏱️ {task.estimatedTime}</span>
                </div>
                <button 
                  onClick={() => addTask(task)}
                  className="add-task-btn"
                >
                  + Agregar Tarea
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITaskGenerator;
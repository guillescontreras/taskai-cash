import React, { useState, useEffect } from 'react';

interface Task {
  taskId: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'completed' | 'expired';
  category: string;
  type: 'survey' | 'video' | 'download' | 'signup' | 'review';
  url?: string;
  requirements?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: (response: string) => void;
}

const TaskModal: React.FC<ModalProps> = ({ isOpen, onClose, task, onComplete }) => {
  const [response, setResponse] = useState('');
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isOpen && task?.type === 'video') {
      setTimeLeft(30); // 30 segundos para videos
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep(2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleComplete = () => {
    if (task.type === 'survey' && response.trim().length < 10) {
      alert('Debes escribir una respuesta de al menos 10 caracteres.');
      return;
    }
    onComplete(response);
    setResponse('');
    setStep(1);
    setTimeLeft(0);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{task.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {task.type === 'survey' && (
            <div className="survey-task">
              <p>{task.description}</p>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe tu respuesta aquí (mínimo 10 caracteres)..."
                rows={4}
              />
              <p className="char-count">{response.length}/10 caracteres</p>
            </div>
          )}

          {task.type === 'video' && (
            <div className="video-task">
              {step === 1 ? (
                <div className="video-player">
                  <div className="fake-video">
                    <p>🎥 Reproduciendo video...</p>
                    <p>Tiempo restante: {timeLeft}s</p>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{width: `${((30-timeLeft)/30)*100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="video-complete">
                  <p>✅ Video completado</p>
                  <p>¿Qué te pareció el contenido?</p>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Opcional: Comparte tu opinión..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {task.type === 'download' && (
            <div className="download-task">
              <p>{task.description}</p>
              <div className="download-steps">
                <p>1. Haz clic en el enlace de descarga</p>
                <p>2. Instala la aplicación</p>
                <p>3. Ábrela y úsala por 2 minutos</p>
                <p>4. Toma una captura de pantalla</p>
              </div>
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="download-link">
                📱 Descargar App
              </a>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Pega el enlace de tu captura de pantalla o describe tu experiencia..."
                rows={3}
              />
            </div>
          )}

          {task.type === 'signup' && (
            <div className="signup-task">
              <p>{task.description}</p>
              <div className="signup-steps">
                <p>1. Haz clic en el enlace</p>
                <p>2. Regístrate con tu email</p>
                <p>3. Confirma tu cuenta</p>
                <p>4. Vuelve aquí para confirmar</p>
              </div>
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="signup-link">
                🔗 Ir al sitio web
              </a>
              <input
                type="email"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Email usado para el registro"
              />
            </div>
          )}

          {task.type === 'review' && (
            <div className="review-task">
              <p>{task.description}</p>
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="review-link">
                ⭐ Ir a dejar reseña
              </a>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Copia aquí el texto de tu reseña..."
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="reward-info">
            💰 Recompensa: ${(task.reward/100).toFixed(2)} ARS
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn">Cancelar</button>
            <button 
              onClick={handleComplete} 
              className="complete-btn"
              disabled={task.type === 'video' && step === 1}
            >
              {task.type === 'video' && step === 1 ? 'Esperando...' : 'Completar Tarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Tareas reales tipo Swagbucks
    setTimeout(() => {
      setTasks([
        {
          taskId: '1',
          title: 'Encuesta sobre Compras Online',
          description: 'Responde 8 preguntas sobre tus hábitos de compra en línea',
          reward: 25,
          status: 'pending',
          category: 'surveys',
          type: 'survey',
          requirements: 'Respuesta mínima 10 caracteres'
        },
        {
          taskId: '2',
          title: 'Ver Video de Producto',
          description: 'Mira un video de 30 segundos sobre productos ecológicos',
          reward: 15,
          status: 'pending',
          category: 'videos',
          type: 'video'
        },
        {
          taskId: '3',
          title: 'Descargar App de Fitness',
          description: 'Descarga FitTracker, úsala 2 minutos y toma captura',
          reward: 50,
          status: 'pending',
          category: 'downloads',
          type: 'download',
          url: 'https://play.google.com/store'
        },
        {
          taskId: '4',
          title: 'Registrarse en Newsletter',
          description: 'Regístrate en el newsletter de EcoLife y confirma tu email',
          reward: 30,
          status: 'pending',
          category: 'signups',
          type: 'signup',
          url: 'https://example.com/newsletter'
        },
        {
          taskId: '5',
          title: 'Reseña en Google Maps',
          description: 'Deja una reseña honesta de un restaurante local',
          reward: 40,
          status: 'pending',
          category: 'reviews',
          type: 'review',
          url: 'https://maps.google.com'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const completeTask = async (response: string) => {
    if (!selectedTask) return;

    // Actualizar estado de la tarea
    setTasks(tasks.map(t => 
      t.taskId === selectedTask.taskId 
        ? { ...t, status: 'completed' as const }
        : t
    ));
    
    // Actualizar balance
    const currentBalance = parseFloat(localStorage.getItem('taskAIBalance') || '0');
    const newBalance = currentBalance + selectedTask.reward;
    localStorage.setItem('taskAIBalance', newBalance.toString());
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('balanceUpdate', {
      detail: { newBalance }
    }));
    
    setModalOpen(false);
    setSelectedTask(null);
  };

  const getTaskIcon = (type: string) => {
    switch(type) {
      case 'survey': return '📋';
      case 'video': return '🎥';
      case 'download': return '📱';
      case 'signup': return '✉️';
      case 'review': return '⭐';
      default: return '📝';
    }
  };

  if (loading) {
    return <div className="loading">Cargando tareas...</div>;
  }

  return (
    <div className="task-list">
      <h2>💼 Tareas Disponibles</h2>
      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task.taskId} className={`task-card ${task.status}`}>
            <div className="task-header">
              <span className="task-icon">{getTaskIcon(task.type)}</span>
              <h3>{task.title}</h3>
              <span className="task-reward">${(task.reward/100).toFixed(2)}</span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-footer">
              <span className="task-category">#{task.category}</span>
              {task.status === 'pending' && (
                <button 
                  onClick={() => openTaskModal(task)}
                  className="complete-btn"
                >
                  Empezar
                </button>
              )}
              {task.status === 'completed' && (
                <span className="completed-badge">✅ Completada</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        onComplete={completeTask}
      />
    </div>
  );
};

export default TaskList;
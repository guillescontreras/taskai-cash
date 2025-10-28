import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { config } from './config';
import TaskList from './components/TaskList';
import AITaskGenerator from './components/AITaskGenerator';
import UserBalance from './components/UserBalance';
import './App.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.Auth.userPoolId,
      userPoolClientId: config.Auth.userPoolWebClientId,
    }
  }
});

function App() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app">
          <header className="app-header">
            <h1>💰 TaskAI Cash</h1>
            <div className="header-actions">
              <UserBalance />
              <button onClick={signOut} className="sign-out-btn">
                Salir
              </button>
            </div>
          </header>

          <nav className="tab-nav">
            <button 
              className={activeTab === 'tasks' ? 'active' : ''}
              onClick={() => setActiveTab('tasks')}
            >
              📋 Mis Tareas
            </button>
            <button 
              className={activeTab === 'ai' ? 'active' : ''}
              onClick={() => setActiveTab('ai')}
            >
              🤖 Generar IA
            </button>
          </nav>

          <main className="app-main">
            {activeTab === 'tasks' && <TaskList />}
            {activeTab === 'ai' && <AITaskGenerator />}
          </main>

          <footer className="app-footer">
            <p>Gana dinero completando tareas simples</p>
          </footer>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
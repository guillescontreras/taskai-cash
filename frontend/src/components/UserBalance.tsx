import React, { useState, useEffect } from 'react';
import { config } from '../config';

const UserBalance: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      // Mock API call - replace with real endpoint
      const response = await fetch(`${config.API.baseURL}/users/balance`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth header here
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      } else {
        // Fallback to localStorage for demo
        const savedBalance = localStorage.getItem('taskAIBalance');
        setBalance(savedBalance ? parseFloat(savedBalance) : 0);
      }
    } catch (error) {
      // Fallback to localStorage for demo
      const savedBalance = localStorage.getItem('taskAIBalance');
      setBalance(savedBalance ? parseFloat(savedBalance) : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    
    // Listen for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail.newBalance);
    };
    
    window.addEventListener('balanceUpdate', handleBalanceUpdate as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdate', handleBalanceUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="user-balance">
        <span className="balance-label">Balance:</span>
        <span className="balance-amount">...</span>
      </div>
    );
  }

  return (
    <div className="user-balance">
      <span className="balance-label">Balance:</span>
      <span className="balance-amount">${(balance / 100).toFixed(2)}</span>
    </div>
  );
};

export default UserBalance;
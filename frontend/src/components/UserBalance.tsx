import React, { useState, useEffect } from 'react';

const UserBalance: React.FC = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Mock balance - replace with real API call
    setBalance(125.50);
  }, []);

  return (
    <div className="user-balance">
      <span className="balance-label">Balance:</span>
      <span className="balance-amount">${balance.toFixed(2)}</span>
    </div>
  );
};

export default UserBalance;
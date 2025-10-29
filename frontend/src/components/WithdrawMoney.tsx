import React, { useState } from 'react';
import { config } from '../config';

const WithdrawMoney: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${config.API.baseURL}/payments/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header here
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(amount) * 100), // Convert to centavos
          cbu: cbu || undefined,
          alias: alias || undefined,
          accountHolder,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}. ID: ${data.transferId}`);
        setAmount('');
        setCbu('');
        setAlias('');
        setAccountHolder('');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-money">
      <h2>💰 Retirar Dinero</h2>
      <div className="withdraw-info">
        <p><strong>Mínimo:</strong> $100 ARS</p>
        <p><strong>Comisión:</strong> $50 ARS</p>
        <p><strong>Tiempo:</strong> Mismo día hábil</p>
      </div>

      <form onSubmit={handleWithdraw} className="withdraw-form">
        <div className="form-group">
          <label>Monto a retirar (ARS)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            step="0.01"
            required
            placeholder="100.00"
          />
        </div>

        <div className="form-group">
          <label>Titular de la cuenta</label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            required
            placeholder="Juan Pérez"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>CBU (22 dígitos)</label>
            <input
              type="text"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
              maxLength={22}
              placeholder="1234567890123456789012"
            />
          </div>
          
          <div className="form-divider">O</div>
          
          <div className="form-group">
            <label>Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="mi.alias.mp"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || (!cbu && !alias)}
          className="withdraw-btn"
        >
          {loading ? 'Procesando...' : 'Retirar Dinero'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="withdraw-help">
        <h3>💡 Ayuda</h3>
        <p><strong>CBU:</strong> Número de 22 dígitos de tu cuenta bancaria</p>
        <p><strong>Alias:</strong> Nombre personalizado de tu cuenta (ej: mi.alias.mp)</p>
        <p><strong>Horarios:</strong> Transferencias de 6:00 a 20:00 hs</p>
      </div>
    </div>
  );
};

export default WithdrawMoney;
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC = () => {
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [canWatchAd, setCanWatchAd] = useState(true);
  const DAILY_LIMIT = 500; // $5 ARS máximo por día
  const AD_REWARD = 3; // $0.03 ARS por anuncio (más conservador)

  useEffect(() => {
    // Verificar límite diario
    const today = new Date().toDateString();
    const lastAdDate = localStorage.getItem('lastAdDate');
    const todayEarnings = parseInt(localStorage.getItem('dailyAdEarnings') || '0');
    
    if (lastAdDate !== today) {
      localStorage.setItem('dailyAdEarnings', '0');
      setDailyEarnings(0);
    } else {
      setDailyEarnings(todayEarnings);
    }
    
    setCanWatchAd(todayEarnings < DAILY_LIMIT);

    // Inicializar AdSense con tu Publisher ID real
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const watchAd = () => {
    if (!canWatchAd) return;
    
    const today = new Date().toDateString();
    const newDailyEarnings = dailyEarnings + AD_REWARD;
    
    // Actualizar balance
    const currentBalance = parseFloat(localStorage.getItem('taskAIBalance') || '0');
    const newBalance = currentBalance + AD_REWARD;
    localStorage.setItem('taskAIBalance', newBalance.toString());
    
    // Actualizar límites diarios
    localStorage.setItem('dailyAdEarnings', newDailyEarnings.toString());
    localStorage.setItem('lastAdDate', today);
    setDailyEarnings(newDailyEarnings);
    
    if (newDailyEarnings >= DAILY_LIMIT) {
      setCanWatchAd(false);
    }
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('balanceUpdate', {
      detail: { newBalance }
    }));
    
    alert(`¡Ganaste $${(AD_REWARD/100).toFixed(2)} ARS por ver el anuncio!`);
  };

  return (
    <div className="ad-banner">
      <div className="ad-placeholder">
        <ins className="adsbygoogle"
             style={{display: 'block', width: '100%', height: '280px'}}
             data-ad-client="ca-pub-3663587138046068"
             data-ad-slot="6300978111"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        
        <div className="ad-controls">
          <p>📱 Ver Anuncios</p>
          <p>Ganado hoy: ${(dailyEarnings/100).toFixed(2)} / ${(DAILY_LIMIT/100).toFixed(2)} ARS</p>
          
          {canWatchAd ? (
            <button className="watch-ad-btn" onClick={watchAd}>
              Ver Anuncio (+${(AD_REWARD/100).toFixed(2)} ARS)
            </button>
          ) : (
            <button className="watch-ad-btn" disabled>
              Límite diario alcanzado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
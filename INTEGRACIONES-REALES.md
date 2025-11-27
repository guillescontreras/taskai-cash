# 💼 Integraciones de Tareas Reales

## 🎯 Plataformas que Pagan por Referidos/Afiliados

### 1. **CPALead** - Encuestas y Ofertas
- **URL**: https://www.cpalead.com
- **Pago**: $0.50 - $5.00 USD por completar
- **Tu ganancia**: 60-80% del pago
- **API**: Sí, tienen API REST
- **Registro**: Necesitas aplicar como publisher

### 2. **AdGate Media** - Ofertas Variadas  
- **URL**: https://www.adgatemedia.com
- **Pago**: $0.25 - $10.00 USD por tarea
- **Tu ganancia**: 70-85% del pago
- **API**: Sí, API completa
- **Registro**: Aplicación como publisher

### 3. **OfferToro** - Encuestas y Descargas
- **URL**: https://www.offertoro.com
- **Pago**: $0.10 - $3.00 USD por tarea
- **Tu ganancia**: 75% del pago
- **API**: Sí, webhook callbacks
- **Registro**: Inmediato para publishers

### 4. **AdscendMedia** - Ofertas Premium
- **URL**: https://adscendmedia.com
- **Pago**: $0.50 - $15.00 USD por tarea
- **Tu ganancia**: 80% del pago
- **API**: REST API + Postbacks
- **Registro**: Aplicación requerida

### 5. **Revenue Universe** - Tareas Variadas
- **URL**: https://www.revenueuniverse.com
- **Pago**: $0.20 - $8.00 USD por tarea
- **Tu ganancia**: 70% del pago
- **API**: Sí, con postbacks
- **Registro**: Aplicación como publisher

## 📱 Para Descargas de Apps

### 6. **IronSource** - Offerwall
- **URL**: https://www.is.com/offerwall/
- **Pago**: $0.10 - $2.00 USD por descarga
- **Tu ganancia**: 70% del pago
- **API**: SDK + REST API
- **Registro**: Aplicación requerida

### 7. **Fyber** - Mobile Advertising
- **URL**: https://www.fyber.com
- **Pago**: $0.15 - $3.00 USD por descarga
- **Tu ganancia**: 75% del pago
- **API**: SDK completo
- **Registro**: Aplicación como publisher

## 🎥 Para Videos

### 8. **AdColony** - Video Rewards
- **URL**: https://www.adcolony.com
- **Pago**: $0.01 - $0.10 USD por video
- **Tu ganancia**: 70% del pago
- **API**: SDK + REST API
- **Registro**: Aplicación requerida

## 📊 Encuestas Específicas

### 9. **Pollfish** - Encuestas Premium
- **URL**: https://www.pollfish.com
- **Pago**: $0.30 - $5.00 USD por encuesta
- **Tu ganancia**: 50% del pago
- **API**: REST API completa
- **Registro**: Inmediato

### 10. **Theorem Reach** - Encuestas Segmentadas
- **URL**: https://theoremreach.com
- **Pago**: $0.50 - $3.00 USD por encuesta
- **Tu ganancia**: 60% del pago
- **API**: JavaScript SDK + API
- **Registro**: Aplicación requerida

## 🚀 RECOMENDACIÓN PARA EMPEZAR

### Paso 1: **OfferToro** (Más Fácil)
1. Regístrate en https://www.offertoro.com
2. Aplica como publisher
3. Obtén tu Publisher ID
4. Integra su API

### Paso 2: **Pollfish** (Encuestas)
1. Regístrate en https://www.pollfish.com
2. Crea tu app
3. Obtén API Key
4. Integra encuestas

### Paso 3: **AdGate Media** (Más Variedad)
1. Aplica en https://www.adgatemedia.com
2. Espera aprobación (1-3 días)
3. Obtén Wall ID
4. Integra ofertas

## 💡 MODELO DE INTEGRACIÓN

```javascript
// Ejemplo de integración OfferToro
const OFFERTORO_CONFIG = {
  publisherId: 'TU_PUBLISHER_ID',
  appId: 'TU_APP_ID',
  secretKey: 'TU_SECRET_KEY',
  baseUrl: 'https://www.offertoro.com/api'
};

// Obtener ofertas disponibles
const getOffers = async (userId) => {
  const response = await fetch(`${OFFERTORO_CONFIG.baseUrl}/offers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${OFFERTORO_CONFIG.secretKey}`,
      'Content-Type': 'application/json'
    },
    params: {
      pub_id: OFFERTORO_CONFIG.publisherId,
      user_id: userId
    }
  });
  return response.json();
};

// Callback cuando usuario completa tarea
const handleOfferComplete = (data) => {
  const userReward = data.payout * 0.7; // 70% para el usuario
  const appProfit = data.payout * 0.3;  // 30% para ti
  
  // Actualizar balance del usuario
  updateUserBalance(data.user_id, userReward);
  
  // Registrar tu ganancia
  recordAppProfit(appProfit);
};
```

## 📋 PRÓXIMOS PASOS

1. **Elige 1-2 plataformas** para empezar
2. **Regístrate como publisher**
3. **Obtén credenciales API**
4. **Integra en el backend**
5. **Configura webhooks/postbacks**
6. **Prueba con usuarios reales**

¿Con cuál plataforma quieres empezar?
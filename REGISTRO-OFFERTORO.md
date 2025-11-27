# 🚀 Cómo Registrarse en OfferToro

## Paso 1: Registro como Publisher
1. Ve a: https://www.offertoro.com/publishers
2. Haz clic en "Sign Up"
3. Completa el formulario:
   - **Company Name**: TaskAI Cash
   - **Website URL**: https://d1evw7tv861bdq.cloudfront.net
   - **Traffic Source**: Mobile App/PWA
   - **Monthly Visitors**: 1000+ (estimado)
   - **Country**: Argentina

## Paso 2: Información Requerida
- **Descripción de tu app**: "Aplicación móvil donde usuarios completan tareas simples para ganar dinero"
- **Tipo de tráfico**: Orgánico, usuarios reales
- **Método de pago**: PayPal o Wire Transfer
- **Tax Information**: Completar según tu situación fiscal en Argentina

## Paso 3: Después de la Aprobación
Una vez aprobado (1-3 días), obtendrás:
- **Publisher ID**: Tu identificador único
- **Secret Key**: Para verificar postbacks
- **API Access**: Para obtener ofertas programáticamente

## Paso 4: Configurar Variables de Entorno
```bash
# Agregar a tu .env
OFFERTORO_PUBLISHER_ID=tu_publisher_id_aqui
OFFERTORO_SECRET_KEY=tu_secret_key_aqui
```

## Paso 5: Configurar Postback URL
En el panel de OfferToro, configura:
- **Postback URL**: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/integrations/offertoro/postback
- **Parameters**: user_id={user_id}&offer_id={offer_id}&payout={payout}&status={status}&signature={signature}

## 💰 Ganancias Esperadas
- **Encuestas**: $0.30 - $3.00 USD (tu ganancia: 30%)
- **Descargas**: $0.50 - $5.00 USD (tu ganancia: 30%)  
- **Registros**: $0.25 - $2.00 USD (tu ganancia: 30%)
- **Compras**: $1.00 - $20.00 USD (tu ganancia: 30%)

## 📊 Métricas Típicas
- **Conversion Rate**: 5-15%
- **Payout por Usuario**: $0.50 - $2.00 USD promedio
- **Tu Ganancia Mensual**: $150 - $500 USD (con 1000 usuarios activos)

## ⚠️ Requisitos Importantes
1. **Tráfico Real**: No bots, no tráfico falso
2. **Usuarios Únicos**: Cada usuario debe tener ID único
3. **Postback Security**: Siempre verificar signatures
4. **Compliance**: Seguir términos de servicio

## 🔄 Alternativas si OfferToro no Aprueba
1. **AdGate Media**: https://www.adgatemedia.com
2. **Revenue Universe**: https://www.revenueuniverse.com  
3. **CPALead**: https://www.cpalead.com
4. **Pollfish** (solo encuestas): https://www.pollfish.com

¿Quieres que te ayude con el registro o prefieres probar con otra plataforma?
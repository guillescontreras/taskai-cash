#!/bin/bash

echo "🚀 Configurando integraciones de TaskAI Cash..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para preguntar por input
ask_input() {
    echo -e "${YELLOW}$1${NC}"
    read -r response
    echo "$response"
}

echo "📋 Configuración de integraciones requeridas:"
echo ""

# 1. Stripe
echo -e "${GREEN}1. STRIPE CONNECT${NC}"
STRIPE_SECRET=$(ask_input "Ingresa tu Stripe Secret Key (sk_test_...):")
STRIPE_PUBLISHABLE=$(ask_input "Ingresa tu Stripe Publishable Key (pk_test_...):")

if [[ $STRIPE_SECRET == sk_test_* ]]; then
    echo "✅ Stripe configurado"
    # Actualizar Lambda
    aws lambda update-function-configuration \
        --function-name TaskAICashStack-PaymentsFunction* \
        --environment Variables="{\"STRIPE_SECRET_KEY\":\"$STRIPE_SECRET\",\"USERS_TABLE\":\"taskai-users\",\"BALANCES_TABLE\":\"taskai-balances\"}" \
        2>/dev/null || echo "⚠️  Actualiza manualmente la función Lambda"
else
    echo -e "${RED}❌ Stripe key inválida${NC}"
fi

echo ""

# 2. AdMob
echo -e "${GREEN}2. ADMOB${NC}"
ADMOB_APP_ID=$(ask_input "Ingresa tu AdMob App ID (ca-app-pub-...):")
ADMOB_BANNER=$(ask_input "Ingresa tu Banner Ad Unit ID:")
ADMOB_INTERSTITIAL=$(ask_input "Ingresa tu Interstitial Ad Unit ID:")
ADMOB_REWARDED=$(ask_input "Ingresa tu Rewarded Ad Unit ID:")

if [[ $ADMOB_APP_ID == ca-app-pub-* ]]; then
    echo "✅ AdMob configurado"
    # Crear archivo de configuración
    cat > frontend/src/admob-config.js << EOF
export const ADMOB_CONFIG = {
  appId: '$ADMOB_APP_ID',
  adUnits: {
    banner: '$ADMOB_BANNER',
    interstitial: '$ADMOB_INTERSTITIAL',
    rewarded: '$ADMOB_REWARDED'
  }
};
EOF
else
    echo -e "${RED}❌ AdMob App ID inválido${NC}"
fi

echo ""

# 3. Bedrock
echo -e "${GREEN}3. AMAZON BEDROCK${NC}"
echo "Verificando acceso a Bedrock..."

# Verificar si Bedrock está disponible
if aws bedrock list-foundation-models --region us-east-1 &>/dev/null; then
    echo "✅ Bedrock disponible"
    
    # Verificar modelo Claude
    if aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude-3-haiku`)]' | grep -q "claude"; then
        echo "✅ Claude 3 Haiku disponible"
    else
        echo -e "${YELLOW}⚠️  Solicita acceso a Claude 3 Haiku en AWS Console > Bedrock > Model access${NC}"
    fi
else
    echo -e "${RED}❌ Bedrock no disponible en esta región${NC}"
fi

echo ""

# 4. Resumen
echo -e "${GREEN}📊 RESUMEN DE CONFIGURACIÓN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 URLs importantes:"
echo "   App: https://d1evw7tv861bdq.cloudfront.net"
echo "   API: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/"
echo ""
echo "📱 Próximos pasos:"
echo "   1. Completa configuración de Stripe en dashboard"
echo "   2. Configura webhooks de Stripe"
echo "   3. Solicita acceso a modelos Bedrock si es necesario"
echo "   4. Integra AdMob en el frontend"
echo "   5. Prueba todas las funcionalidades"
echo ""
echo "🧪 Para probar:"
echo "   node test-all-apis.js"
echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
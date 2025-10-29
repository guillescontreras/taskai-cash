#!/bin/bash

echo "🇦🇷 Configurando TaskAI Cash para Argentina..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}1. MERCADOPAGO CONFIGURACIÓN${NC}"
echo "Ve a: https://www.mercadopago.com.ar/developers"
echo ""

read -p "TEST-6577608642489505-102823-d1a74ad9a6b5b80b45be919319582f7d-72789424
" MP_TOKEN
read -p "TEST-7fe53647-dde1-4ee6-84dd-fedc2ff4bf80" MP_PUBLIC_KEY

if [[ $MP_TOKEN == *"TEST"* ]] || [[ $MP_TOKEN == *"APP_USR"* ]]; then
    echo "✅ Token válido"
    
    # Actualizar Lambda
    aws lambda update-function-configuration \
        --function-name $(aws lambda list-functions --query 'Functions[?contains(FunctionName, `PaymentsFunction`)].FunctionName' --output text) \
        --environment Variables="{\"MP_ACCESS_TOKEN\":\"$MP_TOKEN\",\"USERS_TABLE\":\"taskai-users\",\"BALANCES_TABLE\":\"taskai-balances\"}" \
        2>/dev/null && echo "✅ Lambda actualizada" || echo "⚠️ Actualiza Lambda manualmente"
else
    echo -e "${RED}❌ Token inválido${NC}"
fi

echo ""
echo -e "${GREEN}2. ADMOB CONFIGURACIÓN${NC}"
echo "Ya configuraste AdMob ✅"

echo ""
echo -e "${GREEN}3. CONFIGURACIÓN ARGENTINA ESPECÍFICA${NC}"
echo "💰 Comisiones MercadoPago:"
echo "   - Transferencia bancaria: $50 ARS fijo"
echo "   - Comisión por cobro: 2.99% + IVA"
echo "   - Retiro mínimo: $100 ARS"

echo ""
echo "📋 URLs importantes:"
echo "   App: https://d1evw7tv861bdq.cloudfront.net"
echo "   API: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/"
echo "   Webhook: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/payments/webhook"

echo ""
echo -e "${GREEN}4. PRÓXIMOS PASOS${NC}"
echo "1. Configura webhook en MercadoPago con la URL de arriba"
echo "2. Compila y despliega el backend:"
echo "   cd backend && npm run build"
echo "   cd ../infrastructure && npx cdk deploy"
echo "3. Actualiza el frontend con el componente de retiros"
echo "4. Prueba con las credenciales de TEST primero"

echo ""
echo -e "${GREEN}✅ Configuración Argentina completada!${NC}"
# 💳 Configuración de Stripe Connect

## Paso 1: Crear cuenta Stripe
1. Ve a https://stripe.com
2. Crea cuenta empresarial
3. Completa verificación de identidad
4. Activa Stripe Connect

## Paso 2: Obtener claves API
```bash
# Dashboard > Developers > API keys
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Paso 3: Configurar Connect
```bash
# Dashboard > Connect > Settings
- Platform settings: Enabled
- OAuth settings: Configure redirect URLs
- Express accounts: Enabled
```

## Paso 4: Actualizar Lambda
```bash
# Actualizar variable de entorno
aws lambda update-function-configuration \
  --function-name TaskAICashStack-PaymentsFunction \
  --environment Variables='{
    "STRIPE_SECRET_KEY":"sk_test_TU_CLAVE_REAL",
    "USERS_TABLE":"taskai-users",
    "BALANCES_TABLE":"taskai-balances"
  }'
```

## Paso 5: Webhook para pagos
- URL: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/payments/webhook
- Eventos: payment_intent.succeeded, payout.paid
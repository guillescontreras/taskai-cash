# 💳 MercadoPago Argentina - Configuración

## Paso 1: Crear cuenta
1. Ve a https://www.mercadopago.com.ar
2. Registrate con tu CUIT/CUIL
3. Completa verificación de identidad
4. Activa cuenta para recibir dinero

## Paso 2: Obtener credenciales
1. Ve a https://www.mercadopago.com.ar/developers
2. Crea una aplicación
3. Obtén las credenciales:

```bash
# Credenciales de prueba
TEST_ACCESS_TOKEN=TEST-6577608642489505-102823-d1a74ad9a6b5b80b45be919319582f7d-72789424

TEST_PUBLIC_KEY=TEST-7fe53647-dde1-4ee6-84dd-fedc2ff4bf80

# Credenciales de producción (después de aprobar la app)
ACCESS_TOKEN=APP_USR-XXXXXXXX
PUBLIC_KEY=APP_USR-XXXXXXXX
```

## Paso 3: Configurar webhooks
- URL: https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/payments/webhook
- Eventos: payment, merchant_order

## Costos Argentina:
- **Transferencia a cuenta bancaria**: $50 ARS fijo
- **Comisión por cobro**: 2.99% + IVA
- **Retiro mínimo**: $100 ARS
# TaskAI Cash

App móvil PWA para realizar tareas con IA y monetización por ads.

## Arquitectura

- **Frontend**: PWA (React/Vue)
- **Backend**: AWS Lambda + API Gateway
- **Base de datos**: DynamoDB
- **IA**: Amazon Q
- **Autenticación**: Cognito
- **Pagos**: Stripe Connect
- **Ads**: AdMob/Amazon Ad Server
- **Notificaciones**: SNS + SES
- **Analytics**: Pinpoint

## Estructura del proyecto

```
├── infrastructure/     # AWS CDK/Terraform
├── backend/           # Lambda functions
├── frontend/          # PWA React/Vue
├── docs/             # Documentación
└── scripts/          # Scripts de deployment
```

## Deployment

1. Configurar AWS CLI
2. Instalar dependencias
3. Deploy infrastructure
4. Deploy backend
5. Deploy frontend

## Monetización

- Ads intersticiales
- Ads banner
- Ads por completar tareas
- Premium features (opcional)
# 🎛️ Guía de Administración TaskAI Cash

## 📊 Monitoreo y Analytics

### AWS CloudWatch
- **URL**: https://console.aws.amazon.com/cloudwatch/
- **Métricas clave**:
  - Lambda invocations (llamadas a APIs)
  - API Gateway requests
  - DynamoDB read/write capacity
  - Error rates

### Amazon Pinpoint (Analytics)
- **URL**: https://console.aws.amazon.com/pinpoint/
- **Métricas de negocio**:
  - Usuarios activos diarios
  - Retención de usuarios
  - Ingresos por ads
  - Tareas completadas

## 💾 Base de Datos (DynamoDB)

### Tablas principales:
1. **taskai-users**: Información de usuarios
2. **taskai-tasks**: Tareas creadas y completadas
3. **taskai-balances**: Balances y ganancias

### Consultas útiles:
```bash
# Ver usuarios registrados
aws dynamodb scan --table-name taskai-users --select COUNT

# Ver tareas completadas hoy
aws dynamodb scan --table-name taskai-tasks --filter-expression "completedAt > :today" --expression-attribute-values '{":today":{"S":"2024-10-28"}}'

# Ver balances totales
aws dynamodb scan --table-name taskai-balances --projection-expression "userId, currentBalance, totalEarned"
```

## 🔧 Gestión de Funciones Lambda

### Funciones desplegadas:
- **AuthFunction**: Registro y login
- **TasksFunction**: CRUD de tareas
- **AIFunction**: Generación con IA
- **PaymentsFunction**: Pagos y retiros
- **AdsFunction**: Monetización
- **NotificationsFunction**: Push notifications
- **AnalyticsFunction**: Tracking de eventos

### Logs en tiempo real:
```bash
# Ver logs de una función específica
aws logs tail /aws/lambda/TaskAICashStack-AIFunction --follow

# Ver errores recientes
aws logs filter-log-events --log-group-name /aws/lambda/TaskAICashStack-TasksFunction --filter-pattern "ERROR"
```

## 💰 Monetización y Pagos

### Métricas de ingresos:
- **Revenue per user (RPU)**
- **Average revenue per daily active user (ARPDAU)**
- **Lifetime value (LTV)**

### Configuración de ads:
- Editar `backend/src/ads/index.ts`
- Ajustar recompensas por tipo de ad
- Configurar frecuencia de ads

## 🚨 Alertas y Monitoreo

### CloudWatch Alarms recomendadas:
1. **High error rate** (>5% en 5 minutos)
2. **High latency** (>3 segundos promedio)
3. **Low task completion rate** (<50% diario)
4. **High payout requests** (>$1000 diario)

## 🔄 Actualizaciones y Deploy

### Backend:
```bash
cd backend
npm run build
cd ../infrastructure
npx cdk deploy
```

### Frontend:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://taskai-cash-frontend --delete
```

## 📈 KPIs Clave a Monitorear

### Usuarios:
- **DAU** (Daily Active Users)
- **MAU** (Monthly Active Users)
- **Retention Rate** (D1, D7, D30)
- **Churn Rate**

### Monetización:
- **ARPU** (Average Revenue Per User)
- **Ad fill rate**
- **eCPM** (effective Cost Per Mille)
- **Payout ratio** (pagos vs ingresos)

### Operacional:
- **API response time**
- **Error rates**
- **Task completion rate**
- **User satisfaction score**

## 🛠️ Comandos Útiles

### Verificar estado de la app:
```bash
# Test all APIs
node test-all-apis.js

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Monitor Lambda costs
aws ce get-cost-and-usage --time-period Start=2024-10-01,End=2024-10-31 --granularity MONTHLY --metrics BlendedCost --group-by Type=DIMENSION,Key=SERVICE
```

### Backup de datos:
```bash
# Export DynamoDB table
aws dynamodb scan --table-name taskai-users > users-backup.json
aws dynamodb scan --table-name taskai-tasks > tasks-backup.json
aws dynamodb scan --table-name taskai-balances > balances-backup.json
```

## 🎯 Optimizaciones Recomendadas

### Performance:
- Implementar caching con ElastiCache
- Optimizar queries de DynamoDB
- Comprimir respuestas de API

### Costos:
- Usar Reserved Capacity para DynamoDB
- Optimizar tamaño de Lambda functions
- Implementar lifecycle policies en S3

### Seguridad:
- Implementar rate limiting
- Validar inputs más estrictamente
- Auditar permisos IAM regularmente
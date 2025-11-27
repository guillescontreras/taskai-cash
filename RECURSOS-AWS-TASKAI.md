# 🗑️ Recursos AWS del Proyecto TaskAI Cash

## 📋 INVENTARIO COMPLETO

### 🏗️ CloudFormation Stack
- **Stack Name**: `TaskAICashStack`
- **Status**: UPDATE_COMPLETE
- **Created**: 2025-10-28T16:00:40.077000+00:00

### 🔧 Lambda Functions (7 funciones)
1. **AIFunction** - `TaskAICashStack-AIFunction3DD9AA07-slbmxQMhnGOU`
2. **AdsFunction** - `TaskAICashStack-AdsFunction124C4112-K288mLB0gR7l`
3. **AnalyticsFunction** - `TaskAICashStack-AnalyticsFunctionFF8C31E8-CH0cPcRjKqzh`
4. **AuthFunction** - `TaskAICashStack-AuthFunctionA1CD5E0F-7faDepz2OXrH`
5. **NotificationsFunction** - `TaskAICashStack-NotificationsFunctionE347FB50-LEFVSty1eDRQ`
6. **PaymentsFunction** - `TaskAICashStack-PaymentsFunction5ECB5027-DjGdkV79zGiM`
7. **TasksFunction** - `TaskAICashStack-TasksFunction1A043ECB-[ID]`

### 🗄️ DynamoDB Tables (3 tablas)
1. **taskai-balances** - Balances de usuarios
2. **taskai-tasks** - Tareas disponibles
3. **taskai-users** - Información de usuarios

### 🌐 API Gateway
- **API ID**: `zvc196ajpj`
- **Stage**: `prod`
- **URL**: `https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/`
- **Endpoints**: /auth, /tasks, /ai, /payments, /ads, /notifications, /analytics

### 📦 S3 Bucket
- **Bucket Name**: `taskai-cash-frontend`
- **Purpose**: Hosting del frontend React
- **Content**: Aplicación web compilada

### 🌍 CloudFront Distribution
- **Distribution ID**: `E32XZ771FD056X`
- **Domain**: `d1evw7tv861bdq.cloudfront.net`
- **Purpose**: CDN para el frontend

### 👥 Cognito User Pool
- **User Pool ID**: `us-east-1_VExl86ELi`
- **Client ID**: `28klhem8ac92u6j69pniaem1n9`
- **Purpose**: Autenticación de usuarios

### 📢 SNS Topic
- **Topic ARN**: `arn:aws:sns:us-east-1:825765382487:taskai-notifications`
- **Purpose**: Notificaciones push

### 🔐 IAM Roles y Policies (14 recursos)
- Roles de servicio para cada Lambda
- Policies de permisos específicos
- Custom resource providers

### 🛠️ Recursos Auxiliares
- Custom S3 Auto Delete Objects
- API Gateway Methods y Resources (30+ recursos)
- Lambda Permissions (20+ recursos)
- CDK Metadata

## 💰 COSTOS ESTIMADOS

### Costos Mensuales Aproximados:
- **Lambda Functions**: $2-5 USD (bajo uso)
- **DynamoDB**: $1-3 USD (tablas pequeñas)
- **API Gateway**: $1-2 USD (pocas requests)
- **S3**: $0.50 USD (frontend estático)
- **CloudFront**: $0.50 USD (bajo tráfico)
- **Cognito**: $0 USD (bajo volumen)
- **SNS**: $0.10 USD (pocas notificaciones)

**TOTAL ESTIMADO**: $5-12 USD/mes

## 🗑️ PLAN DE ELIMINACIÓN

### Opción 1: Eliminación Completa (Recomendada)
```bash
# Eliminar todo el stack de CloudFormation
aws cloudformation delete-stack --stack-name TaskAICashStack

# Verificar eliminación
aws cloudformation describe-stacks --stack-name TaskAICashStack
```

### Opción 2: Eliminación Manual por Recurso
1. **Vaciar S3 Bucket** (requerido antes de eliminar)
2. **Eliminar CloudFront Distribution**
3. **Eliminar DynamoDB Tables**
4. **Eliminar Lambda Functions**
5. **Eliminar API Gateway**
6. **Eliminar Cognito User Pool**
7. **Eliminar SNS Topic**
8. **Eliminar IAM Roles/Policies**

### ⚠️ CONSIDERACIONES IMPORTANTES

1. **Datos**: Las tablas DynamoDB contienen datos de usuarios
2. **Dominio**: CloudFront distribution tiene dominio público
3. **Usuarios**: Cognito User Pool puede tener usuarios registrados
4. **Dependencias**: Algunos recursos dependen de otros

### 🔄 ALTERNATIVA: Suspensión Temporal
Si quieres conservar la opción de reactivar:
1. **Deshabilitar API Gateway** (detener requests)
2. **Pausar Lambda Functions** (cambiar timeout a mínimo)
3. **Mantener datos** en DynamoDB
4. **Conservar estructura** para reactivación futura

## 📝 ARCHIVOS LOCALES A LIMPIAR

### Directorio del Proyecto:
```
TaskAI Cash/
├── backend/          # Código Lambda
├── frontend/         # Aplicación React
├── infrastructure/   # CDK TypeScript
├── *.md             # Documentación
└── node_modules/    # Dependencias
```

### Archivos de Configuración:
- `setup-admob.md`
- `FLUJO-PAGOS-ADMOB.md`
- `ARREGLAR-ADMOB.md`
- `INTEGRACIONES-REALES.md`
- `REGISTRO-OFFERTORO.md`

¿Quieres proceder con la eliminación completa del stack?
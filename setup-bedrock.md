# 🤖 Configuración de Amazon Bedrock

## Paso 1: Habilitar Bedrock
```bash
# Ir a AWS Console > Bedrock > Model access
# Solicitar acceso a Claude 3 Haiku
aws bedrock list-foundation-models --region us-east-1
```

## Paso 2: Verificar permisos IAM
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
    }
  ]
}
```

## Paso 3: Actualizar función Lambda
```bash
# La función AI ya está configurada, solo necesita permisos
aws iam attach-role-policy \
  --role-name TaskAICashStack-AIFunctionServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## Paso 4: Probar generación IA
```bash
# Test con curl
curl -X POST https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/ai \
  -H "Content-Type: application/json" \
  -d '{"category":"surveys","difficulty":"easy"}'
```

## Nota: Costos de Bedrock
- Claude 3 Haiku: ~$0.25 por 1M tokens input
- ~$1.25 por 1M tokens output
- Estimado: $0.001 por tarea generada
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';

export class TaskAICashStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'taskai-users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const tasksTable = new dynamodb.Table(this, 'TasksTable', {
      tableName: 'taskai-tasks',
      partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const balancesTable = new dynamodb.Table(this, 'BalancesTable', {
      tableName: 'taskai-balances',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'TaskAIUserPool', {
      userPoolName: 'taskai-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'TaskAIUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // S3 Bucket for Frontend
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: 'taskai-cash-frontend',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // SNS Topic for notifications
    const notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      topicName: 'taskai-notifications',
    });

    // Lambda Functions
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'auth/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        BALANCES_TABLE: balancesTable.tableName,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    const tasksFunction = new lambda.Function(this, 'TasksFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'tasks/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        TASKS_TABLE: tasksTable.tableName,
        USERS_TABLE: usersTable.tableName,
        BALANCES_TABLE: balancesTable.tableName,
      },
    });

    const aiFunction = new lambda.Function(this, 'AIFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'ai/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
    });

    const paymentsFunction = new lambda.Function(this, 'PaymentsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'payments/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        BALANCES_TABLE: balancesTable.tableName,
        MP_ACCESS_TOKEN: 'TEST-6577608642489505-102823-d1a74ad9a6b5b80b45be919319582f7d-72789424',
      },
    });

    const adsFunction = new lambda.Function(this, 'AdsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'ads/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        BALANCES_TABLE: balancesTable.tableName,
      },
    });

    const notificationsFunction = new lambda.Function(this, 'NotificationsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'notifications/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        USERS_TABLE: usersTable.tableName,
        NOTIFICATIONS_TOPIC_ARN: notificationsTopic.topicArn,
      },
    });

    const analyticsFunction = new lambda.Function(this, 'AnalyticsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'analytics/index.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      environment: {
        PINPOINT_APP_ID: 'your-pinpoint-app-id',
      },
    });

    // Grant permissions
    usersTable.grantReadWriteData(authFunction);
    balancesTable.grantReadWriteData(authFunction);
    tasksTable.grantReadWriteData(tasksFunction);
    usersTable.grantReadWriteData(tasksFunction);
    balancesTable.grantReadWriteData(tasksFunction);
    tasksTable.grantReadData(aiFunction);
    usersTable.grantReadWriteData(paymentsFunction);
    balancesTable.grantReadWriteData(paymentsFunction);
    usersTable.grantReadWriteData(adsFunction);
    balancesTable.grantReadWriteData(adsFunction);
    usersTable.grantReadWriteData(notificationsFunction);
    notificationsTopic.grantPublish(notificationsFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'TaskAIAPI', {
      restApiName: 'TaskAI Cash API',
      description: 'API for TaskAI Cash application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Routes
    const authResource = api.root.addResource('auth');
    authResource.addMethod('ANY', new apigateway.LambdaIntegration(authFunction));
    const authProxy = authResource.addResource('{proxy+}');
    authProxy.addMethod('ANY', new apigateway.LambdaIntegration(authFunction));

    const tasksResource = api.root.addResource('tasks');
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(tasksFunction));
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(tasksFunction));
    const taskProxy = tasksResource.addResource('{taskId}');
    taskProxy.addMethod('PUT', new apigateway.LambdaIntegration(tasksFunction));

    const aiResource = api.root.addResource('ai');
    aiResource.addMethod('POST', new apigateway.LambdaIntegration(aiFunction));
    const aiProxy = aiResource.addResource('{proxy+}');
    aiProxy.addMethod('ANY', new apigateway.LambdaIntegration(aiFunction));

    const paymentsResource = api.root.addResource('payments');
    paymentsResource.addMethod('ANY', new apigateway.LambdaIntegration(paymentsFunction));
    const paymentsProxy = paymentsResource.addResource('{proxy+}');
    paymentsProxy.addMethod('ANY', new apigateway.LambdaIntegration(paymentsFunction));

    const adsResource = api.root.addResource('ads');
    adsResource.addMethod('ANY', new apigateway.LambdaIntegration(adsFunction));
    const adsProxy = adsResource.addResource('{proxy+}');
    adsProxy.addMethod('ANY', new apigateway.LambdaIntegration(adsFunction));

    const notificationsResource = api.root.addResource('notifications');
    notificationsResource.addMethod('ANY', new apigateway.LambdaIntegration(notificationsFunction));
    const notificationsProxy = notificationsResource.addResource('{proxy+}');
    notificationsProxy.addMethod('ANY', new apigateway.LambdaIntegration(notificationsFunction));

    const analyticsResource = api.root.addResource('analytics');
    analyticsResource.addMethod('POST', new apigateway.LambdaIntegration(analyticsFunction));

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'S3 Frontend Bucket Name',
    });
  }
}
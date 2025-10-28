#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TaskAICashStack } from '../lib/taskai-cash-stack';

const app = new cdk.App();

new TaskAICashStack(app, 'TaskAICashStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
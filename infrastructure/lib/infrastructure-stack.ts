import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { InfrastructureStackProps, DEFAULT_CPU, DEFAULT_MEMORY_MIB, DEFAULT_DESIRED_COUNT } from './config';
import { FargateService } from './constructs/fargate-service';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
      clusterName: `${props.projectName}-cluster`,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      loadBalancerName: `${props.projectName}-alb`,
    });

    const backendTaskRole = new iam.Role(this, 'BackendTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for backend service with DynamoDB access',
    });

    const backendService = new FargateService(this, 'BackendService', {
      cluster,
      vpc,
      dockerImagePath: path.join(__dirname, '../../backend'),
      containerPort: 8000,
      cpu: props.cpu ?? DEFAULT_CPU,
      memoryMiB: props.memoryMiB ?? DEFAULT_MEMORY_MIB,
      desiredCount: props.desiredCount ?? DEFAULT_DESIRED_COUNT,
      healthCheckPath: '/api/health',
      taskRole: backendTaskRole,
    });

    const frontendService = new FargateService(this, 'FrontendService', {
      cluster,
      vpc,
      dockerImagePath: path.join(__dirname, '../../frontend'),
      containerPort: 80, // nginx
      cpu: props.cpu ?? DEFAULT_CPU,
      memoryMiB: props.memoryMiB ?? DEFAULT_MEMORY_MIB,
      desiredCount: props.desiredCount ?? DEFAULT_DESIRED_COUNT,
      healthCheckPath: '/',
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.forward([frontendService.targetGroup]),
    });

    // Add listener rule for /api/* path to route to backend
    listener.addAction('ApiRoute', {
      priority: 10,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      action: elbv2.ListenerAction.forward([backendService.targetGroup]),
    });

    // Allow ALB to communicate with backend service
    backendService.service.connections.allowFrom(
      alb,
      ec2.Port.tcp(8000),
      'Allow ALB to reach backend service'
    );

    // Allow ALB to communicate with frontend service
    frontendService.service.connections.allowFrom(
      alb,
      ec2.Port.tcp(80),
      'Allow ALB to reach frontend service'
    );

    // Export ALB DNS name as CloudFormation output
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
      exportName: `${props.projectName}-alb-dns`,
    });
  }
}

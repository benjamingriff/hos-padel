import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface FargateServiceProps {
  cluster: ecs.ICluster;
  vpc: ec2.IVpc;
  dockerImagePath: string;
  containerPort: number;
  cpu?: number;
  memoryMiB?: number;
  desiredCount?: number;
  environment?: Record<string, string>;
  healthCheckPath?: string;
  taskRole?: iam.IRole;
}

export class FargateService extends Construct {
  public readonly service: ecs.FargateService;
  public readonly targetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: Construct, id: string, props: FargateServiceProps) {
    super(scope, id);

    const cpu = props.cpu ?? 256;
    const memoryMiB = props.memoryMiB ?? 512;
    const desiredCount = props.desiredCount ?? 1;

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      cpu,
      memoryLimitMiB: memoryMiB,
      taskRole: props.taskRole,
    });

    // Add container to task definition using local Docker build
    const container = taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromAsset(props.dockerImagePath),
      environment: props.environment,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: id,
      }),
    });

    container.addPortMappings({
      containerPort: props.containerPort,
    });

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: props.cluster,
      taskDefinition,
      desiredCount,
      assignPublicIp: true, // Required for pulling images without NAT gateway
    });

    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc: props.vpc,
      port: props.containerPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [this.service],
      healthCheck: {
        path: props.healthCheckPath ?? '/',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        timeout: cdk.Duration.seconds(5),
        interval: cdk.Duration.seconds(30),
      },
    });
  }
}

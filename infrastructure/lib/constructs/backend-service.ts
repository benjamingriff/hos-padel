import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';

export interface BackendServiceProps {
  serviceName: string;
  dockerImagePath: string;
  port?: number;
  cpu?: string;
  memory?: string;
  healthCheckPath?: string;
}

export class BackendService extends Construct {
  public readonly service: apprunner.CfnService;
  public readonly serviceUrl: string;

  constructor(scope: Construct, id: string, props: BackendServiceProps) {
    super(scope, id);

    const port = props.port ?? 8000;
    const cpu = props.cpu ?? '0.25 vCPU';
    const memory = props.memory ?? '0.5 GB';
    const healthCheckPath = props.healthCheckPath ?? '/health';

    // Build Docker image
    const image = new ecr_assets.DockerImageAsset(this, 'Image', {
      directory: props.dockerImagePath,
    });

    // IAM role for App Runner to access ECR
    const accessRole = new iam.Role(this, 'AccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'Role for App Runner to access ECR',
    });

    image.repository.grantPull(accessRole);

    // Auto-scaling configuration
    const autoScalingConfig = new apprunner.CfnAutoScalingConfiguration(this, 'AutoScaling', {
      autoScalingConfigurationName: `${props.serviceName}-autoscaling`,
      maxConcurrency: 100,
      maxSize: 2,
      minSize: 1,
    });

    // App Runner service
    this.service = new apprunner.CfnService(this, 'Service', {
      serviceName: props.serviceName,
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageIdentifier: image.imageUri,
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: port.toString(),
          },
        },
      },
      instanceConfiguration: {
        cpu,
        memory,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: healthCheckPath,
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      autoScalingConfigurationArn: autoScalingConfig.attrAutoScalingConfigurationArn,
    });

    this.serviceUrl = this.service.attrServiceUrl;
  }
}

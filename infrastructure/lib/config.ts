import * as cdk from 'aws-cdk-lib';

export interface InfrastructureStackProps extends cdk.StackProps {
  projectName: string
  cpu?: number;
  memoryMiB?: number;
  desiredCount?: number;
}

export const DEFAULT_CPU = 256;
export const DEFAULT_MEMORY_MIB = 512;
export const DEFAULT_DESIRED_COUNT = 1;

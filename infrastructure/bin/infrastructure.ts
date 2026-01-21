#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CiIamStack } from "../lib/ci-iam-stack";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import {
  InfrastructureStackProps,
  DEFAULT_CPU,
  DEFAULT_MEMORY_MIB,
  DEFAULT_DESIRED_COUNT,
} from "../lib/config";

const app = new cdk.App();

// const props: InfrastructureStackProps = {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   projectName: "hos-padel",
//   cpu: DEFAULT_CPU,
//   memoryMiB: DEFAULT_MEMORY_MIB,
//   desiredCount: DEFAULT_DESIRED_COUNT,
// };

new CiIamStack(app, "CiIamStack", {
  githubOwner: "benjamingriff",
  githubRepo: "hos-padel",
});

// new InfrastructureStack(app, "HOSPadelStack", props);

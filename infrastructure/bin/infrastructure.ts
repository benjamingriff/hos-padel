#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
// import { GitHubDeployStack } from "../lib/github-deploy-stack";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// new GitHubDeployStack(app, "HOSPadelDeployStack", {
//   env,
//   githubOwner: "benjamingriff",
//   githubRepo: "hos-padel",
// });

new InfrastructureStack(app, "HOSPadelStack", {
  env,
  projectName: "hos-padel",
});

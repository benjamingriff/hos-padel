import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface GitHubDeployStackProps extends StackProps {
  readonly githubOwner: string;
  readonly githubRepo: string;
  readonly githubBranch?: string;
  readonly cdkQualifier?: string;
}

/**
 * One-time setup stack that creates the GitHub Actions deployment role.
 * Deploy this stack once with admin credentials before using CI/CD.
 */
export class GitHubDeployStack extends Stack {
  public readonly deployRole: iam.Role;

  constructor(scope: Construct, id: string, props: GitHubDeployStackProps) {
    super(scope, id, props);

    const githubBranch = props.githubBranch ?? "main";
    const cdkQualifier = props.cdkQualifier ?? "hnb659fds";

    // Reference existing GitHub OIDC provider (created once per account)
    const oidcProviderArn = `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`;
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GitHubOidcProvider",
      oidcProviderArn,
    );

    const sub = `repo:${props.githubOwner}/${props.githubRepo}:ref:refs/heads/${githubBranch}`;

    // Create deployment role for GitHub Actions
    this.deployRole = new iam.Role(this, "DeployRole", {
      roleName: `GitHubActions-${props.githubRepo}-DeployRole`,
      assumedBy: new iam.WebIdentityPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub": sub,
          },
        },
      ),
    });

    // CDK deployment permissions (assume CDK roles)
    this.deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CDKAssumeRole",
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${this.account}:role/cdk-${cdkQualifier}-*`],
      }),
    );
  }
}

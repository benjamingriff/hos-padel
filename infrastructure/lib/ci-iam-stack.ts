import { CustomResource, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as customResources from "aws-cdk-lib/custom-resources";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";

export interface CiIamStackProps extends StackProps {
  readonly githubOwner: string; // username (personal) OR org
  readonly githubRepo: string;
  readonly githubBranch?: string;
  readonly cdkQualifier?: string;
  readonly deployRoleName?: string;
  readonly oidcProviderUrl?: string;
}

export class CiIamStack extends Stack {
  constructor(scope: Construct, id: string, props: CiIamStackProps) {
    super(scope, id, props);

    const githubBranch = props.githubBranch ?? "main";
    const cdkQualifier = props.cdkQualifier ?? "hnb659fds";
    const deployRoleName = props.deployRoleName ?? "GitHubActionsCdkDeployRole";
    const oidcProviderUrl =
      props.oidcProviderUrl ?? "https://token.actions.githubusercontent.com";

    const deployRole = iam.Role.fromRoleName(
      this,
      "GitHubActionsCdkDeployRole",
      deployRoleName,
    );

    const trustPolicyUpdater = new lambda.Function(
      this,
      "CiIamTrustPolicyUpdater",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
const AWS = require('aws-sdk')

const iam = new AWS.IAM()

const normalizeProviderUrl = (url) => url.replace(/^https?:\\/\\//, '')

const ensureArray = (value) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const actionMatches = (action, expected) => {
  const actions = ensureArray(action)
  return actions.includes(expected)
}

const conditionMatches = (condition, expectedSub) => {
  const stringEquals = condition?.StringEquals
  if (!stringEquals) return false
  return (
    stringEquals['token.actions.githubusercontent.com:aud'] === 'sts.amazonaws.com' &&
    stringEquals['token.actions.githubusercontent.com:sub'] === expectedSub
  )
}

const statementMatches = (statement, providerArn, expectedSub) => {
  if (!actionMatches(statement?.Action, 'sts:AssumeRoleWithWebIdentity')) {
    return false
  }

  if (statement?.Principal?.Federated !== providerArn) {
    return false
  }

  return conditionMatches(statement.Condition, expectedSub)
}

exports.handler = async (event) => {
  const physicalId = event.PhysicalResourceId || 'CiIamTrustPolicyUpdate'

  if (event.RequestType === 'Delete') {
    return { PhysicalResourceId: physicalId }
  }

  const { RoleName, ProviderUrl, GitHubOwner, GitHubRepo, GitHubBranch } = event.ResourceProperties
  const normalizedProviderUrl = normalizeProviderUrl(ProviderUrl)

  const providerList = await iam.listOpenIDConnectProviders().promise()
  let providerArn = null

  for (const provider of providerList.OpenIDConnectProviderList || []) {
    const details = await iam
      .getOpenIDConnectProvider({ OpenIDConnectProviderArn: provider.Arn })
      .promise()

    if (details.Url === normalizedProviderUrl) {
      providerArn = provider.Arn
      break
    }
  }

  if (!providerArn) {
    throw new Error('OIDC provider not found for URL ' + ProviderUrl)
  }

  const role = await iam.getRole({ RoleName }).promise()
  const policyDoc = JSON.parse(decodeURIComponent(role.Role.AssumeRolePolicyDocument))
  const statements = ensureArray(policyDoc.Statement)
  const sub =
    'repo:' + GitHubOwner + '/' + GitHubRepo + ':ref:refs/heads/' + GitHubBranch

  const hasStatement = statements.some((statement) =>
    statementMatches(statement, providerArn, sub),
  )

  if (!hasStatement) {
    const rawSid =
      'GitHubActions' + GitHubOwner + GitHubRepo + GitHubBranch
    const sid = rawSid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 128)

    statements.push({
      Sid: sid,
      Effect: 'Allow',
      Principal: { Federated: providerArn },
      Action: 'sts:AssumeRoleWithWebIdentity',
      Condition: {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': sub,
        },
      },
    })

    await iam
      .updateAssumeRolePolicy({
        RoleName,
        PolicyDocument: JSON.stringify({ ...policyDoc, Statement: statements }),
      })
      .promise()
  }

  return {
    PhysicalResourceId:
      RoleName + '-' + GitHubOwner + '-' + GitHubRepo + '-' + GitHubBranch,
  }
}
        `),
      },
    );

    trustPolicyUpdater.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "iam:GetOpenIDConnectProvider",
          "iam:GetRole",
          "iam:ListOpenIDConnectProviders",
          "iam:UpdateAssumeRolePolicy",
        ],
        resources: ["*"],
      }),
    );

    const trustPolicyProvider = new customResources.Provider(
      this,
      "CiIamTrustPolicyProvider",
      {
        onEventHandler: trustPolicyUpdater,
      },
    );

    new CustomResource(this, "CiIamTrustPolicyUpdate", {
      serviceToken: trustPolicyProvider.serviceToken,
      properties: {
        RoleName: deployRoleName,
        ProviderUrl: oidcProviderUrl,
        GitHubOwner: props.githubOwner,
        GitHubRepo: props.githubRepo,
        GitHubBranch: githubBranch,
      },
    });

    deployRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${this.account}:role/cdk-${cdkQualifier}-*`],
      }),
    );
  }
}

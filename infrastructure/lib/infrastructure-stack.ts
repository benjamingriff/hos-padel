import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { FrontendBucket } from "./constructs/frontend-bucket";
import { BackendService } from "./constructs/backend-service";

export interface InfrastructureStackProps extends cdk.StackProps {
  projectName: string;
}

export class InfrastructureStack extends cdk.Stack {
  public readonly distributionId: string;
  public readonly bucketName: string;
  public readonly cloudfrontUrl: string;

  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    // Frontend: S3 bucket for static files
    const frontend = new FrontendBucket(this, "Frontend", {
      bucketName: `${props.projectName}-frontend`,
    });

    // Backend: App Runner service
    const backend = new BackendService(this, "Backend", {
      serviceName: `${props.projectName}-api`,
      dockerImagePath: path.join(__dirname, "../../backend"),
      port: 8000,
      healthCheckPath: "/api/health",
    });

    // CloudFront distribution with path-based routing
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: `${props.projectName} distribution`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontend.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new origins.HttpOrigin(
            cdk.Fn.select(2, cdk.Fn.split("/", backend.serviceUrl)),
            { protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY },
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Grant CloudFront access to S3 bucket
    frontend.grantCloudFrontAccess(
      `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
    );

    // Deploy frontend files to S3 and invalidate CloudFront
    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist")),
      ],
      destinationBucket: frontend.bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // Store values for exports
    this.distributionId = distribution.distributionId;
    this.bucketName = frontend.bucket.bucketName;
    this.cloudfrontUrl = `https://${distribution.distributionDomainName}`;

    // Outputs
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: this.cloudfrontUrl,
      description: "CloudFront Distribution URL",
      exportName: `${props.projectName}-cloudfront-url`,
    });

    new cdk.CfnOutput(this, "AppRunnerServiceURL", {
      value: `https://${backend.serviceUrl}`,
      description: "App Runner Service URL (backend API)",
      exportName: `${props.projectName}-apprunner-url`,
    });

    new cdk.CfnOutput(this, "S3BucketName", {
      value: frontend.bucket.bucketName,
      description: "S3 Bucket for frontend files",
      exportName: `${props.projectName}-s3-bucket`,
    });

    new cdk.CfnOutput(this, "CloudFrontDistributionId", {
      value: distribution.distributionId,
      description: "CloudFront Distribution ID (for cache invalidation)",
      exportName: `${props.projectName}-distribution-id`,
    });
  }
}

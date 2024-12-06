import {
  CloudFrontToS3,
  CloudFrontToS3Props,
} from '@aws-solutions-constructs/aws-cloudfront-s3';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  BucketProps,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NodejsBuild } from 'deploy-time-build';
import {S3BucketOrigin} from 'aws-cdk-lib/aws-cloudfront-origins';

export interface FrontProps {
  contentBucket: Bucket;
  api: HttpApi;
  userPoolId: string;
  userPoolClientId: string;
}

export class Front extends Construct {
  constructor(scope: Construct, id: string, props: FrontProps) {
    super(scope, id);

    // CloudFront - S3
    const commonBucketProps: BucketProps = {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      enforceSSL: true,
    };

    const cloudFrontToS3Props: CloudFrontToS3Props = {
      insertHttpSecurityHeaders: false,
      existingBucketObj: props.contentBucket,
      cloudFrontLoggingBucketProps: commonBucketProps,
      cloudFrontDistributionProps: {
        defaultBehavior: {
          origin:
            S3BucketOrigin.withOriginAccessControl(
              props.contentBucket
            ),
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
      },
    };

    const { cloudFrontWebDistribution, s3BucketInterface } = new CloudFrontToS3(
      this,
      'CloudFrontToS3',
      cloudFrontToS3Props
    );

    // Build frontend
    new NodejsBuild(this, 'FrontBuild', {
      assets: [
        {
          path: '../../',
          exclude: [
            '.env',
            '.git',
            '.github',
            '.gitignore',
            '*.md',
            'node_modules',
            'packages/cdk/**/*',
            '!packages/cdk/cdk.json',
            'packages/ui/.next',
            'packages/ui/out',
            'packages/ui/node_modules',
            'packages/ui/dev-dist',
          ],
        },
      ],
      destinationBucket: s3BucketInterface,
      distribution: cloudFrontWebDistribution,
      outputSourceDirectory: './packages/ui/out',
      buildCommands: ['npm ci', 'npm -w packages/ui run build'],
      buildEnvironment: {
        NEXT_PUBLIC_API_ENDPOINT: props.api.apiEndpoint,
        NEXT_PUBLIC_USERPOOL_ID: props.userPoolId,
        NEXT_PUBLIC_USERPOOL_CLIENT_ID: props.userPoolClientId,
      }
    });

    new CfnOutput(this, 'CfnOutputCloudFrontDomainName', {
      value: `https://${cloudFrontWebDistribution.distributionDomainName}`,
    });
  }
}

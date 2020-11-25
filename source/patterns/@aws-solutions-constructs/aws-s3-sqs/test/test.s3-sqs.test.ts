/**
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
import { Stack } from "@aws-cdk/core";
import { S3ToSqs, S3ToSqsProps } from "../lib";
import * as sqs from '@aws-cdk/aws-sqs';
import * as kms from '@aws-cdk/aws-kms';
import * as s3 from '@aws-cdk/aws-s3';
import { SynthUtils } from '@aws-cdk/assert';
import '@aws-cdk/assert/jest';
import * as defaults from '@aws-solutions-constructs/core';

// --------------------------------------------------------------
// Test the getter methods
// --------------------------------------------------------------
test('Test getter methods', () => {
    // Initial Setup
    const stack = new Stack();
    const filter: s3.NotificationKeyFilter = { prefix: 'the/place', suffix: '*.mp3' };
    const props: S3ToSqsProps = {
        deployDeadLetterQueue: true,
        maxReceiveCount: 0,
        queueProps: {},
        s3EventTypes: [s3.EventType.OBJECT_REMOVED],
        s3EventFilters: [filter]
    };
    const app = new S3ToSqs(stack, 'test-s3-sqs', props);
    // Assertion 1
    expect(app.sqsQueue !== null);
    // Assertion 2
    expect(app.deadLetterQueue !== null);
    // Assertion 3
    expect(app.s3Bucket !== null);
});

// --------------------------------------------------------------
// Test deployment w/ existing queue
// --------------------------------------------------------------
test('Test deployment w/ existing queue', () => {
  // Stack
  const stack = new Stack();
  // Helper declaration
  const kmsKey: kms.Key = new kms.Key(stack, 'EncryptionKey', {});
  const queue = new sqs.Queue(stack, 'existing-queue-obj', {
    queueName: 'existing-queue-obj',
    encryptionMasterKey: kmsKey
  });
  new S3ToSqs(stack, 'test-s3-sqs', {
    existingQueueObj: queue
  });
  // Assertion 1
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

// --------------------------------------------------------------
// Test deployment w/ existing s3 Bucket
// --------------------------------------------------------------
test('Test deployment w/ existing Bucket', () => {
    // Stack
    const stack = new Stack();
    // Helper declaration

    const [myBucket] = defaults.buildS3Bucket(stack, {});
    new S3ToSqs(stack, 'test-s3-sqs', {
        existingBucketObj: myBucket
    });
    // Assertion 1
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

// --------------------------------------------------------------
// Pattern deployment w/ bucket block public access override
// --------------------------------------------------------------
test('Pattern deployment w/ bucket versioning turned off', () => {
    const stack = new Stack();
    const props: S3ToSqsProps = {
        bucketProps: {
            blockPublicAccess: {
                blockPublicAcls: false,
                blockPublicPolicy: true,
                ignorePublicAcls: false,
                restrictPublicBuckets: true
            }
        }
    };
    new S3ToSqs(stack, 'test-s3-sqs', props);
    expect(stack).toHaveResource("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            BlockPublicPolicy: true,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: true
        }
    });
});

// --------------------------------------------------------------
// Test deployment w/ specific s3 event types
// --------------------------------------------------------------
test('Test deployment w/ s3 event types and filters', () => {
  // Stack
  const stack = new Stack();
  // Helper declaration
  const filter: s3.NotificationKeyFilter = {
    prefix: 'the/place',
    suffix: '*.mp3'
  };
  const props: S3ToSqsProps = {
    deployDeadLetterQueue: true,
    maxReceiveCount: 0,
    queueProps: {},
    s3EventTypes: [s3.EventType.OBJECT_REMOVED],
    s3EventFilters: [filter]
  };
  new S3ToSqs(stack, 'test-s3-sqs', props);
  // Assertion 1
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  // Assertion 2
  expect(stack).toHaveResource("Custom::S3BucketNotifications", {
    NotificationConfiguration: {
      QueueConfigurations: [
        {
          Events: ['s3:ObjectRemoved:*'],
          Filter: {
            Key: {
              FilterRules: [
                {
                  Name: 'suffix',
                  Value: '*.mp3'
                },
                {
                  Name: 'prefix',
                  Value: 'the/place'
                }
              ]
            }
          },
          QueueArn: {
            "Fn::GetAtt": [
              "tests3sqsqueue810CCE19",
              "Arn"
            ]
          }
        }
      ]
    }
  });
  // Assertion 1
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

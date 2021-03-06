/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as kinesis from '@aws-cdk/aws-kinesis';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sqs from '@aws-cdk/aws-sqs';
import * as mediastore from '@aws-cdk/aws-mediastore';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as sns from '@aws-cdk/aws-sns';
import * as glue from '@aws-cdk/aws-glue';
import * as sagemaker from '@aws-cdk/aws-sagemaker';
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as kms from "@aws-cdk/aws-kms";

export interface VerifiedProps {
  readonly dynamoTableProps?: dynamodb.TableProps,
  readonly existingTableObj?: dynamodb.Table,

  readonly existingStreamObj?: kinesis.Stream;
  readonly kinesisStreamProps?: kinesis.StreamProps,

  readonly existingLambdaObj?: lambda.Function,
  readonly lambdaFunctionProps?: lambda.FunctionProps,

  readonly existingQueueObj?: sqs.Queue,
  readonly queueProps?: sqs.QueueProps,
  readonly deployDeadLetterQueue?: boolean,
  readonly deadLetterQueueProps?: sqs.QueueProps,

  readonly existingMediaStoreContainerObj?: mediastore.CfnContainer;
  readonly mediaStoreContainerProps?: mediastore.CfnContainerProps;

  readonly existingBucketObj?: s3.Bucket,
  readonly bucketProps?: s3.BucketProps,

  // topicsProps is an incorrect attribute used in event-rule-sns that
  // we need to support
  readonly topicProps?: sns.TopicProps,
  readonly topicsProps?: sns.TopicProps,
  readonly existingTopicObj?: sns.Topic,

  readonly glueJobProps?: glue.CfnJobProps,
  readonly existingGlueJob?: glue.CfnJob,

  readonly existingSagemakerEndpointObj?: sagemaker.CfnEndpoint,
  readonly endpointProps?: sagemaker.CfnEndpointProps,

  readonly existingSecretObj?: secretsmanager.Secret;
  readonly secretProps?: secretsmanager.SecretProps;

  readonly existingVpc?: ec2.IVpc;
  readonly vpcProps?: ec2.VpcProps;
  readonly deployVpc?: boolean;

  readonly encryptionKey?: kms.Key,
  readonly encryptionKeyProps?: kms.KeyProps

}

export function CheckProps(propsObject: VerifiedProps | any) {
  let errorMessages = '';
  let errorFound = false;

  if (propsObject.dynamoTableProps && propsObject.existingTableObj) {
    errorMessages += 'Error - Either provide existingTableObj or dynamoTableProps, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingStreamObj  && propsObject.kinesisStreamProps) {
    errorMessages += 'Error - Either provide existingStreamObj or kinesisStreamProps, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingLambdaObj && propsObject.lambdaFunctionProps) {
    errorMessages += 'Error - Either provide lambdaFunctionProps or existingLambdaObj, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingQueueObj && propsObject.queueProps) {
    errorMessages += 'Error - Either provide queueProps or existingQueueObj, but not both.\n';
    errorFound = true;
  }

  if ((propsObject?.deployDeadLetterQueue === false) && propsObject.deadLetterQueueProps) {
    errorMessages += 'Error - If deployDeadLetterQueue is false then deadLetterQueueProps cannot be specified.\n';
    errorFound = true;
  }

  if (propsObject.existingMediaStoreContainerObj && propsObject.mediaStoreContainerProps) {
    errorMessages += 'Error - Either provide mediaStoreContainerProps or existingMediaStoreContainerObj, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingBucketObj && propsObject.bucketProps) {
    errorMessages += 'Error - Either provide bucketProps or existingBucketObj, but not both.\n';
    errorFound = true;
  }

  if ((propsObject.topicProps || propsObject.topicsProps) && propsObject.existingTopicObj) {
    errorMessages += 'Error - Either provide topicProps or existingTopicObj, but not both.\n';
    errorFound = true;
  }

  if (propsObject.glueJobProps && propsObject.existingGlueJob) {
    errorMessages += 'Error - Either provide glueJobProps or existingGlueJob, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingSagemakerEndpointObj && propsObject.endpointProps) {
    errorMessages += 'Error - Either provide endpointProps or existingSagemakerEndpointObj, but not both.\n';
    errorFound = true;
  }

  if (propsObject.existingSecretObj && propsObject.secretProps) {
    errorMessages += 'Error - Either provide secretProps or existingSecretObj, but not both.\n';
    errorFound = true;
  }

  // if (deployVpc || vpcProp) and existingVpc
  if ((propsObject.deployVpc || propsObject.vpcProps) && propsObject.existingVpc) {
    errorMessages += 'Error - Either provide an existingVpc or some combination of deployVpc and vpcProps, but not both.\n';
    errorFound = true;
  }

  if (propsObject.encryptionKey && propsObject.encryptionKeyProps) {
    errorMessages += 'Error - Either provide encryptionKey or encryptionKeyProps, but not both.\n';
    errorFound = true;
  }

  if (errorFound) {
    throw new Error(errorMessages);
  }
}
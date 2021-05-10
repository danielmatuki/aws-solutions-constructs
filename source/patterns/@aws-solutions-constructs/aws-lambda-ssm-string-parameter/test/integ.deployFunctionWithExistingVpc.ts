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

// Imports
import {App, Stack} from "@aws-cdk/core";
import {LambdaToSsmStringParameter, LambdaToSsmStringParameterProps} from '../lib';
import * as lambda from "@aws-cdk/aws-lambda";
import * as defaults from '@aws-solutions-constructs/core';

// Setup
const app = new App();
const stack = new Stack(app, "test-lambda-ssm-string-parameter-stack");
stack.templateOptions.description = "Integration Test for test-lambda-ssm-string-parameter";

// Create VPC
const vpc = defaults.buildVpc(stack, {
  defaultVpcProps: defaults.DefaultPublicPrivateVpcProps(),
  constructVpcProps: {
    enableDnsHostnames: true,
    enableDnsSupport: true,
  },
});

// Definitions
const props: LambdaToSsmStringParameterProps = {
  lambdaFunctionProps: {
    runtime: lambda.Runtime.NODEJS_10_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(`${__dirname}/lambda`)
  },
  stringParameterProps: { stringValue: "test-string-value" },
  existingVpc: vpc
};

new LambdaToSsmStringParameter(stack, 'test-lambda-ssm-string-parameter', props);

// Synth
app.synth();

# Python Stack - Configuration

Stack allows for a certain level of flexibility to accommodate various applications' needs. All changes are applied during the steps in the [AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html) we will take a closer on each of them.

![deploy--pipeline.png](../deploy/img/deploy--pipeline.png)

## Build

This step utilizes [AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html) and executes the commands specified in the [aws/buildspec.yaml](/aws/buildspec.yaml) file of the application.

A short overview of the default commands:

* Login to the [AWS ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html) repository.
* Pull the values from the Secret and make them available to the application via `.env` file.
* Build the Docker image from the sources.
    * Platform's Python runtime image is used as `FROM` for the application image (e.g. [3.10.Dockerfile](https://github.com/pJeremyDemers/the-sink/tree/main/runtimes/python/3.10.Dockerfile)).
    * Application's [aws/Dockerfile](/aws/Dockerfile) is used for build.
* Push the Docker image to the ECR repository.

## CloudFormation

This step updates the application's CloudFormation stack.

* Platform defines the default set of resources necessary for the application in [cfn-template.yml](https://github.com/JeremyDemers/the-sink/tree/main/stacks/python/cfn-template.yml).
* Application's [aws/cfn-template.yml](/aws/cfn-template.yml) includes default resources as the [nested stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-nested-stacks.html).
* Changes to both files will be automatically applied.
* Environment settings like `Runtime Version`, `TaskCpu`, `TaskMemory`, etc., are stored in the `aws/cfn-template-configuration-<env>.json` files and can be modified if more computing power is needed.
    * [aws/cfn-template-configuration-stage.json](/aws/cfn-template-configuration-stage.json)
    * [aws/cfn-template-configuration-uat.json](/aws/cfn-template-configuration-uat.json)
    * [aws/cfn-template-configuration-prod.json](/aws/cfn-template-configuration-prod.json)

## UpdateService

This step starts the new [AWS ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) task using the Docker image built on the [Build](#build) step and, after a new task is up, stops the previous version.

No configuration is available for the step itself as the instance's parameters are controlled by the [CloudFormation](#cloudformation).

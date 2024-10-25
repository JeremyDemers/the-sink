# Lambda R Stack - Configuration

Stack allows for a certain level of flexibility to accommodate various applications' needs. All changes are applied
using [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html). The open-source package [lambdr](https://github.com/mdneuzerling/lambdr) provides a handy wrapper to make running `R` code inside AWS Lambda easy.

## Common

This step builds a `common` layer for all Lambda functions.

It was introduced because Lambda functions can only be responsible for one API route to avoid code duplication.

* The `common` folder of the application allows you to put any additional libraries or packages that all your Lambda
  functions require.
* You can do so using the `Dockerfile`, which is present in the folder.
* The `common` image will always use Platform's Lambda R runtime image as `FROM` (
  e.g. [4.2.Dockerfile](https://github.com/JeremyDemers/the-sink/tree/main/runtimes/lambda/r/4.2.Dockerfile)).

## SAM Build

This step runs the [`sam build`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html).

In a nutshell, this command does next:

    * Each Lambda function has its own `Dockerfile` (e.g. [smart-lab-web-uv-report-r/get_tbl_from_pdf/Dockerfile](https://github.com/JeremyDemers/the-sink/blob/main/get_tbl_from_pdf/Dockerfile)) that copies the code inside the Docker container and sets it as a command to be executed on container start.
    * The [common](#common) Docker image will be used as `FROM`.
* Environment settings like `Timeout`, `MemorySize`, `EphemeralStorage`, etc., are stored in the [samconfig.toml](https://github.com/JeremyDemers/the-sink/blob/main/samconfig.toml) file and can be modified if more computing power is needed.

More about the described approach can be found in the [lambdr example](https://github.com/mdneuzerling/lambdr#example)

## SAM Deploy

This step runs the [`sam deploy`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html).

* Pushes the Docker images to the ECR repository.
    * This template is called [SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html). It is very similar to the CloudFormation template but provides some shortcuts that make a definition of Lambda function easier.

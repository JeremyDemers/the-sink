# Lambda R Stack - Deploy

The stack is built using [AWS Serverless Application Model (SAM)](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-reference.html).

## Stage

Whenever changes are merged to the `main` branch, the `CI` workflow starts deployment, during which:

* The `CI/deploy` task performs [`sam build`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) and [`sam deploy`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) commands.

More details about the deployment process and configuration of the stack can be found here [config](../config)

## UAT and Prod

Unlike the `stage` environment, `uat` and `prod` will not be automatically updated with the latest changes from the `main` branch.


![init--deploy.png](../init/img/init--deploy.png)

* `The commit sha to use as a source for deployment` copy the SHA of the commit from the `main` branch to specify the version to deploy (in most cases, it would be the latest commit).
* `The target tag used by the app environment to deploy` select `uat` or `prod`.

This action will do `git checkout` to the commit with specified SHA trigger the same actions as in the `deploy_common`and `deploy` tasks of the `CI` workflow.

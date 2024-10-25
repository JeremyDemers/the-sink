# Lambda R Stack - Permanent Storage

In practice, the [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) function is a Docker container. It means that there is no permanent storage by default.

There are two options for permanent storage or file exchange between the Lambda function and other applications:
* [S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) to store and access objects via AWS SDK. 
* [AWS EFS](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html) can be mounted as a Docker Volume. See example

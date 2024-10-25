# Python Stack - Permanent Storage

Given that [AWS ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) task in practice is a Docker container. It means that there is only permanent storage if you mount a volume. That's where [AWS EFS](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html) comes in handy. It provides flexible file storage that supports NFS and allows you to mount it as a Docker volume.

By default, each stack comes with the EFS volume mounted to the `/mnt/shared` path (see [cfn-template.yml](https://github.com/JeremyDemers/the-sink/tree/main/stacks/python/cfn-template.yml#L365-L381)).

import boto3
import uuid
import os.path

class Uploader:
    def __init__:
        print(settings.AWS_ACCESS_KEY_ID)
        self.client = boto3.client(
            's3',
            aws_access_key_id = settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

    def toS3(self,filename, file):
        key = str(uuid.uuid1()) + os.path.splitext(filename)[1]
        self.client.put_object(Bucket=settings.S3_BUCKET, Key=key,Body=file.read())
        return key

    def fromS3(self,key):
        return self.client.get_object(Bucket=settings.S3_BUCKET,Key=key)['Body'].read()
        
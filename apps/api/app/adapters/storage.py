import boto3
from botocore.exceptions import ClientError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class StorageAdapter:
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET_NAME

    def upload_file(self, file_content: bytes, storage_key: str, content_type: str) -> str:
        """Uploads raw file bytes to AWS S3 and returns the storage key."""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_key,
                Body=file_content,
                ContentType=content_type
            )
            logger.info(f"Successfully uploaded {storage_key} to S3 bucket {self.bucket_name}")
            return storage_key
        except ClientError as e:
            logger.error(f"Error uploading file {storage_key} to S3: {e}")
            raise e

    def generate_presigned_url(self, storage_key: str, expiration: int = 3600) -> str:
        """Generates a temporary signed download URL for viewing documents."""
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": storage_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL for {storage_key}: {e}")
            raise e

    def get_file_content(self, storage_key: str) -> bytes:
        """Retrieves raw file bytes from S3."""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=storage_key)
            return response["Body"].read()
        except ClientError as e:
            logger.error(f"Error reading file {storage_key} from S3: {e}")
            raise e

storage_adapter = StorageAdapter()

const awsS3Config = require("../config/AwsS3Config");
const s3Config = awsS3Config.defaultInstance;
const { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand 
} = require("@aws-sdk/client-s3");

class AwsHelper {
  constructor() {
    // Initialize the S3 client
    this.s3 = s3Config.getS3Client();
    this.bucketName = s3Config.getBucketName();
  }

  uploadFileToS3 = async (fileBuffer, fileName, fileType, folderName) => {
    try {
      const key = `${folderName}/${fileName}`;
      // Define S3 upload parameters
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
      };
      await s3Config.sendCommand(
        new PutObjectCommand(params)
      );
  
      return key;
    } catch (error) {
      throw error;
    }
  };

  getFileFromS3 = async (fileName, expiresIn) => {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      // Generate and return a signed URL for the file
      return await s3Config.getSignedUrl(command, { expiresIn });
    } catch (error) {
      throw error;
    }
  };


  deleteFileFromS3 = async (fileName) => {
    try {
      // Define S3 delete parameters
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };

      // Create and send the delete command
      const command = new DeleteObjectCommand(params);
      await s3Config.sendCommand(command);

      // Return a success message
      return { success: true, message: "File deleted successfully" };
    } catch (error) {
      throw error;
    }
  };

  deleteFolderFromS3 = async (folderPath) => {
    try {
      // First, list all objects in the folder
      const listParams = {
        Bucket: this.bucketName,
        Prefix: folderPath,
      };

      const listCommand = new ListObjectsV2Command(listParams);
      const listedObjects = await s3Config.sendCommand(listCommand);

      // If no objects found, return success
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        return { success: true, message: "Folder is empty or doesn't exist" };
      }

      // Prepare objects for deletion
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
          Quiet: false, // Set to true to reduce response verbosity
        },
      };

      // Delete all objects
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await s3Config.sendCommand(deleteCommand);

      // Handle pagination if more than 1000 objects
      if (listedObjects.IsTruncated) {
        // Recursive call to delete remaining objects
        await this.deleteFolderFromS3(folderPath);
      }

      // Return a success message
      return { success: true, message: "Folder deleted successfully" };
    } catch (error) {
      throw error;
    }
  };
}

module.exports = new AwsHelper();
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("./InitEnv");
const constant = require("../constant/Constant");

class AwsS3Config {
  #bucketName;
  #s3Client;

  constructor() {
    // Correctly assign the bucket name and initialize the S3 client
    this.#bucketName = constant.S3_BUCKET_NAME;

    this.#s3Client = new S3Client({
      region: config.aws.bucketRegion,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  /**
   * Returns the S3 client instance.
   */
  getS3Client() {
    return this.#s3Client;
  }

  /**
   * Returns the S3 bucket name.
   */
  getBucketName() {
    return this.#bucketName;
  }

  /**
   * Sends a command to the S3 client.
   **/
  async sendCommand(command) {
    try {
      return await this.#s3Client.send(command);
    } catch (error) {
      console.error("S3 operation failed:", error);
      throw new Error(`S3 operation failed: ${error.message}`);
    }
  }

  /**
   * Generates a signed URL for the specified command.
   */
  async getSignedUrl(command, options) {
    try {
      return await getSignedUrl(this.#s3Client, command, options);
    } catch (error) {
      console.error("Signed URL generation failed:", error);
      throw new Error(`Signed URL generation failed: ${error.message}`);
    }
  }
}

// Export the class itself for flexibility
module.exports = AwsS3Config;

// Optionally, export a singleton instance if needed
module.exports.defaultInstance = new AwsS3Config();
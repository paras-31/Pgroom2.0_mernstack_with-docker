// initEnv.js
const dotenv = require("dotenv");
const constant = require("../constant/Constant");

// Load .env only if not in Railway (production environment)
if (process.env.APP_ENV !== constant.PRODUCTION) {
  const result = dotenv.config();
  if (result.error) {
    console.warn("⚠️ Warning: Could not load .env file. Make sure it exists locally.");
  }
}

const config = {
  server: {
    port: process.env.PORT,
  },
  db: {
    databaseURL: process.env.DATABASE_URL,
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_name: process.env.DB_NAME,
    db_port: process.env.DB_PORT,
  },
  jwt: {
    jwt_secret_key: process.env.JWT_SECRET_KEY,
  },
  gmail: {
    user : process.env.GMAIL_USER_MAIL,
    pass : process.env.GMAIL_APP_PASSWORD,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketRegion: process.env.AWS_BUCKET_REGION,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  payment: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  }
};
module.exports = config;

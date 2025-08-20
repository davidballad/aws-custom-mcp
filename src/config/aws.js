const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Export AWS SDK and common services
module.exports = {
  AWS,
  EC2: new AWS.EC2(),
  S3: new AWS.S3(),
  RDS: new AWS.RDS(),
  CloudWatch: new AWS.CloudWatch(),
  IAM: new AWS.IAM(),
  Lambda: new AWS.Lambda(),
};
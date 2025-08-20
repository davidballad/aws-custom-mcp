const express = require('express');
const router = express.Router();

// Import AWS services
const { EC2, S3, RDS, CloudWatch, IAM, Lambda } = require('../config/aws');

// Import controllers
const ec2Controller = require('../controllers/ec2Controller');
const s3Controller = require('../controllers/s3Controller');
const rdsController = require('../controllers/rdsController');
const iamController = require('../controllers/iamController');
const lambdaController = require('../controllers/lambdaController');

// EC2 Routes
router.get('/ec2/instances', ec2Controller.listInstances);
router.post('/ec2/instances/:instanceId/start', ec2Controller.startInstance);
router.post('/ec2/instances/:instanceId/stop', ec2Controller.stopInstance);
router.post('/ec2/instances/:instanceId/reboot', ec2Controller.rebootInstance);
router.post('/ec2/instances/:instanceId/terminate', ec2Controller.terminateInstance);
router.get('/ec2/instances/:instanceId', ec2Controller.describeInstance);

// S3 Routes
router.get('/s3/buckets', s3Controller.listBuckets);
router.get('/s3/buckets/:bucketName/objects', s3Controller.listObjects);
router.post('/s3/buckets', s3Controller.createBucket);
router.delete('/s3/buckets/:bucketName', s3Controller.deleteBucket);

// RDS Routes
router.get('/rds/instances', rdsController.listInstances);
router.get('/rds/instances/:dbInstanceId', rdsController.describeInstance);
router.post('/rds/instances/:dbInstanceId/start', rdsController.startInstance);
router.post('/rds/instances/:dbInstanceId/stop', rdsController.stopInstance);

// IAM Routes
router.get('/iam/users', iamController.listUsers);
router.get('/iam/roles', iamController.listRoles);
router.get('/iam/policies', iamController.listPolicies);

// Lambda Routes
router.get('/lambda/functions', lambdaController.listFunctions);
router.get('/lambda/functions/:functionName', lambdaController.getFunction);
router.post('/lambda/functions/:functionName/invoke', lambdaController.invokeFunction);

// General AWS info
router.get('/regions', async (req, res) => {
  try {
    const regions = [
      { name: 'US East (N. Virginia)', code: 'us-east-1' },
      { name: 'US East (Ohio)', code: 'us-east-2' },
      { name: 'US West (N. California)', code: 'us-west-1' },
      { name: 'US West (Oregon)', code: 'us-west-2' },
      { name: 'Africa (Cape Town)', code: 'af-south-1' },
      { name: 'Asia Pacific (Hong Kong)', code: 'ap-east-1' },
      { name: 'Asia Pacific (Mumbai)', code: 'ap-south-1' },
      { name: 'Asia Pacific (Seoul)', code: 'ap-northeast-2' },
      { name: 'Asia Pacific (Singapore)', code: 'ap-southeast-1' },
      { name: 'Asia Pacific (Sydney)', code: 'ap-southeast-2' },
      { name: 'Asia Pacific (Tokyo)', code: 'ap-northeast-1' },
      { name: 'Canada (Central)', code: 'ca-central-1' },
      { name: 'Europe (Frankfurt)', code: 'eu-central-1' },
      { name: 'Europe (Ireland)', code: 'eu-west-1' },
      { name: 'Europe (London)', code: 'eu-west-2' },
      { name: 'Europe (Milan)', code: 'eu-south-1' },
      { name: 'Europe (Paris)', code: 'eu-west-3' },
      { name: 'Europe (Stockholm)', code: 'eu-north-1' },
      { name: 'Middle East (Bahrain)', code: 'me-south-1' },
      { name: 'South America (São Paulo)', code: 'sa-east-1' },
    ];
    res.json({ regions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
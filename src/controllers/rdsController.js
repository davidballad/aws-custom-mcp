const { RDS } = require('../config/aws');

/**
 * List all RDS instances
 */
exports.listInstances = async (req, res) => {
  try {
    const data = await RDS.describeDBInstances().promise();
    
    const instances = data.DBInstances.map(instance => ({
      identifier: instance.DBInstanceIdentifier,
      engine: instance.Engine,
      engineVersion: instance.EngineVersion,
      status: instance.DBInstanceStatus,
      endpoint: instance.Endpoint ? instance.Endpoint.Address : null,
      port: instance.Endpoint ? instance.Endpoint.Port : null,
      allocatedStorage: instance.AllocatedStorage,
      instanceClass: instance.DBInstanceClass,
      availabilityZone: instance.AvailabilityZone,
      multiAZ: instance.MultiAZ,
      createdTime: instance.InstanceCreateTime
    }));
    
    res.json({ instances });
  } catch (error) {
    console.error('Error listing RDS instances:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Describe a specific RDS instance
 */
exports.describeInstance = async (req, res) => {
  try {
    const { dbInstanceId } = req.params;
    
    const params = {
      DBInstanceIdentifier: dbInstanceId
    };
    
    const data = await RDS.describeDBInstances(params).promise();
    
    if (data.DBInstances.length === 0) {
      return res.status(404).json({ error: 'DB instance not found' });
    }
    
    const instance = data.DBInstances[0];
    
    const instanceDetails = {
      identifier: instance.DBInstanceIdentifier,
      engine: instance.Engine,
      engineVersion: instance.EngineVersion,
      status: instance.DBInstanceStatus,
      endpoint: instance.Endpoint ? instance.Endpoint.Address : null,
      port: instance.Endpoint ? instance.Endpoint.Port : null,
      allocatedStorage: instance.AllocatedStorage,
      instanceClass: instance.DBInstanceClass,
      availabilityZone: instance.AvailabilityZone,
      multiAZ: instance.MultiAZ,
      createdTime: instance.InstanceCreateTime,
      storageType: instance.StorageType,
      backupRetentionPeriod: instance.BackupRetentionPeriod,
      vpcId: instance.DBSubnetGroup ? instance.DBSubnetGroup.VpcId : null,
      publiclyAccessible: instance.PubliclyAccessible,
      storageEncrypted: instance.StorageEncrypted,
      dbName: instance.DBName,
      masterUsername: instance.MasterUsername
    };
    
    res.json({ instance: instanceDetails });
  } catch (error) {
    console.error(`Error describing RDS instance ${req.params.dbInstanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Start an RDS instance
 */
exports.startInstance = async (req, res) => {
  try {
    const { dbInstanceId } = req.params;
    
    const params = {
      DBInstanceIdentifier: dbInstanceId
    };
    
    await RDS.startDBInstance(params).promise();
    
    res.json({ message: `DB instance ${dbInstanceId} starting` });
  } catch (error) {
    console.error(`Error starting RDS instance ${req.params.dbInstanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stop an RDS instance
 */
exports.stopInstance = async (req, res) => {
  try {
    const { dbInstanceId } = req.params;
    
    const params = {
      DBInstanceIdentifier: dbInstanceId
    };
    
    await RDS.stopDBInstance(params).promise();
    
    res.json({ message: `DB instance ${dbInstanceId} stopping` });
  } catch (error) {
    console.error(`Error stopping RDS instance ${req.params.dbInstanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};
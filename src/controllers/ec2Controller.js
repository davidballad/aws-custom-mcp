const { EC2 } = require('../config/aws');

/**
 * List all EC2 instances
 */
exports.listInstances = async (req, res) => {
  try {
    const data = await EC2.describeInstances().promise();
    
    // Extract instance information from the response
    const instances = [];
    
    data.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        // Find the Name tag if it exists
        let name = '';
        if (instance.Tags) {
          const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
          if (nameTag) {
            name = nameTag.Value;
          }
        }
        
        instances.push({
          id: instance.InstanceId,
          type: instance.InstanceType,
          state: instance.State.Name,
          publicIp: instance.PublicIpAddress || '',
          privateIp: instance.PrivateIpAddress || '',
          name: name,
          launchTime: instance.LaunchTime,
          availabilityZone: instance.Placement.AvailabilityZone,
          vpcId: instance.VpcId || '',
          subnetId: instance.SubnetId || '',
          tags: instance.Tags || []
        });
      });
    });
    
    res.json({ instances });
  } catch (error) {
    console.error('Error listing EC2 instances:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Describe a specific EC2 instance
 */
exports.describeInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const params = {
      InstanceIds: [instanceId]
    };
    
    const data = await EC2.describeInstances(params).promise();
    
    if (data.Reservations.length === 0 || data.Reservations[0].Instances.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }
    
    const instance = data.Reservations[0].Instances[0];
    
    // Find the Name tag if it exists
    let name = '';
    if (instance.Tags) {
      const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
      if (nameTag) {
        name = nameTag.Value;
      }
    }
    
    const instanceDetails = {
      id: instance.InstanceId,
      type: instance.InstanceType,
      state: instance.State.Name,
      publicIp: instance.PublicIpAddress || '',
      privateIp: instance.PrivateIpAddress || '',
      name: name,
      launchTime: instance.LaunchTime,
      availabilityZone: instance.Placement.AvailabilityZone,
      vpcId: instance.VpcId || '',
      subnetId: instance.SubnetId || '',
      securityGroups: instance.SecurityGroups || [],
      imageId: instance.ImageId,
      keyName: instance.KeyName || '',
      monitoring: instance.Monitoring.State,
      tags: instance.Tags || []
    };
    
    res.json({ instance: instanceDetails });
  } catch (error) {
    console.error(`Error describing EC2 instance ${req.params.instanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Start an EC2 instance
 */
exports.startInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const params = {
      InstanceIds: [instanceId]
    };
    
    await EC2.startInstances(params).promise();
    
    res.json({ message: `Instance ${instanceId} starting` });
  } catch (error) {
    console.error(`Error starting EC2 instance ${req.params.instanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stop an EC2 instance
 */
exports.stopInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const params = {
      InstanceIds: [instanceId]
    };
    
    await EC2.stopInstances(params).promise();
    
    res.json({ message: `Instance ${instanceId} stopping` });
  } catch (error) {
    console.error(`Error stopping EC2 instance ${req.params.instanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reboot an EC2 instance
 */
exports.rebootInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const params = {
      InstanceIds: [instanceId]
    };
    
    await EC2.rebootInstances(params).promise();
    
    res.json({ message: `Instance ${instanceId} rebooting` });
  } catch (error) {
    console.error(`Error rebooting EC2 instance ${req.params.instanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Terminate an EC2 instance
 */
exports.terminateInstance = async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const params = {
      InstanceIds: [instanceId]
    };
    
    await EC2.terminateInstances(params).promise();
    
    res.json({ message: `Instance ${instanceId} terminating` });
  } catch (error) {
    console.error(`Error terminating EC2 instance ${req.params.instanceId}:`, error);
    res.status(500).json({ error: error.message });
  }
};
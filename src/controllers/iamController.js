const { IAM } = require('../config/aws');

/**
 * List all IAM users
 */
exports.listUsers = async (req, res) => {
  try {
    const data = await IAM.listUsers().promise();
    
    const users = data.Users.map(user => ({
      id: user.UserId,
      name: user.UserName,
      arn: user.Arn,
      createdDate: user.CreateDate,
      path: user.Path
    }));
    
    res.json({ users });
  } catch (error) {
    console.error('Error listing IAM users:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * List all IAM roles
 */
exports.listRoles = async (req, res) => {
  try {
    const data = await IAM.listRoles().promise();
    
    const roles = data.Roles.map(role => ({
      id: role.RoleId,
      name: role.RoleName,
      arn: role.Arn,
      createdDate: role.CreateDate,
      path: role.Path,
      description: role.Description || ''
    }));
    
    res.json({ roles });
  } catch (error) {
    console.error('Error listing IAM roles:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * List all IAM policies
 */
exports.listPolicies = async (req, res) => {
  try {
    const { scope = 'All', onlyAttached = false } = req.query;
    
    const params = {
      Scope: scope,
      OnlyAttached: onlyAttached === 'true'
    };
    
    const data = await IAM.listPolicies(params).promise();
    
    const policies = data.Policies.map(policy => ({
      id: policy.PolicyId,
      name: policy.PolicyName,
      arn: policy.Arn,
      createdDate: policy.CreateDate,
      updatedDate: policy.UpdateDate,
      attachmentCount: policy.AttachmentCount,
      isAttachable: policy.IsAttachable,
      path: policy.Path,
      defaultVersionId: policy.DefaultVersionId
    }));
    
    res.json({ policies });
  } catch (error) {
    console.error('Error listing IAM policies:', error);
    res.status(500).json({ error: error.message });
  }
};
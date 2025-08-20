const { Lambda } = require('../config/aws');

/**
 * List all Lambda functions
 */
exports.listFunctions = async (req, res) => {
  try {
    const data = await Lambda.listFunctions().promise();
    
    const functions = data.Functions.map(func => ({
      name: func.FunctionName,
      arn: func.FunctionArn,
      runtime: func.Runtime,
      description: func.Description || '',
      handler: func.Handler,
      codeSize: func.CodeSize,
      timeout: func.Timeout,
      memory: func.MemorySize,
      lastModified: func.LastModified,
      version: func.Version
    }));
    
    res.json({ functions });
  } catch (error) {
    console.error('Error listing Lambda functions:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a specific Lambda function
 */
exports.getFunction = async (req, res) => {
  try {
    const { functionName } = req.params;
    
    const params = {
      FunctionName: functionName
    };
    
    const data = await Lambda.getFunction(params).promise();
    
    const functionDetails = {
      name: data.Configuration.FunctionName,
      arn: data.Configuration.FunctionArn,
      runtime: data.Configuration.Runtime,
      description: data.Configuration.Description || '',
      handler: data.Configuration.Handler,
      codeSize: data.Configuration.CodeSize,
      timeout: data.Configuration.Timeout,
      memory: data.Configuration.MemorySize,
      lastModified: data.Configuration.LastModified,
      version: data.Configuration.Version,
      environment: data.Configuration.Environment ? data.Configuration.Environment.Variables : {},
      role: data.Configuration.Role,
      codeLocation: data.Code.Location
    };
    
    res.json({ function: functionDetails });
  } catch (error) {
    console.error(`Error getting Lambda function ${req.params.functionName}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Invoke a Lambda function
 */
exports.invokeFunction = async (req, res) => {
  try {
    const { functionName } = req.params;
    const { payload, invocationType = 'RequestResponse' } = req.body;
    
    const params = {
      FunctionName: functionName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload || {})
    };
    
    const data = await Lambda.invoke(params).promise();
    
    let responsePayload;
    if (data.Payload) {
      responsePayload = JSON.parse(data.Payload);
    }
    
    res.json({
      statusCode: data.StatusCode,
      executedVersion: data.ExecutedVersion,
      functionError: data.FunctionError,
      logResult: data.LogResult,
      payload: responsePayload
    });
  } catch (error) {
    console.error(`Error invoking Lambda function ${req.params.functionName}:`, error);
    res.status(500).json({ error: error.message });
  }
};
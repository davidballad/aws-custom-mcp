const { S3 } = require('../config/aws');

/**
 * List all S3 buckets
 */
exports.listBuckets = async (req, res) => {
  try {
    const data = await S3.listBuckets().promise();
    
    const buckets = data.Buckets.map(bucket => ({
      name: bucket.Name,
      creationDate: bucket.CreationDate
    }));
    
    res.json({ buckets });
  } catch (error) {
    console.error('Error listing S3 buckets:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * List objects in a specific S3 bucket
 */
exports.listObjects = async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { prefix = '', delimiter = '/' } = req.query;
    
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: delimiter
    };
    
    const data = await S3.listObjectsV2(params).promise();
    
    const objects = data.Contents ? data.Contents.map(object => ({
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
      etag: object.ETag,
      storageClass: object.StorageClass
    })) : [];
    
    const folders = data.CommonPrefixes ? data.CommonPrefixes.map(prefix => ({
      prefix: prefix.Prefix
    })) : [];
    
    res.json({
      objects,
      folders,
      prefix: data.Prefix,
      delimiter: data.Delimiter,
      isTruncated: data.IsTruncated,
      nextContinuationToken: data.NextContinuationToken
    });
  } catch (error) {
    console.error(`Error listing objects in bucket ${req.params.bucketName}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new S3 bucket
 */
exports.createBucket = async (req, res) => {
  try {
    const { bucketName, region } = req.body;
    
    if (!bucketName) {
      return res.status(400).json({ error: 'Bucket name is required' });
    }
    
    const params = {
      Bucket: bucketName,
      CreateBucketConfiguration: region ? {
        LocationConstraint: region
      } : undefined
    };
    
    const data = await S3.createBucket(params).promise();
    
    res.status(201).json({
      message: `Bucket ${bucketName} created successfully`,
      location: data.Location
    });
  } catch (error) {
    console.error('Error creating S3 bucket:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an S3 bucket
 */
exports.deleteBucket = async (req, res) => {
  try {
    const { bucketName } = req.params;
    
    const params = {
      Bucket: bucketName
    };
    
    await S3.deleteBucket(params).promise();
    
    res.json({ message: `Bucket ${bucketName} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting bucket ${req.params.bucketName}:`, error);
    res.status(500).json({ error: error.message });
  }
};
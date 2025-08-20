document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

// Global variables
let currentRegion = '';

/**
 * Initialize the application
 */
function initApp() {
  // Set up navigation
  setupNavigation();
  
  // Load regions
  loadRegions();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadDashboardData();
}

/**
 * Set up navigation between sections
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('[data-section]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('active');
      });
      
      document.querySelectorAll(`.nav-link[data-section="${sectionId}"]`).forEach(navLink => {
        navLink.classList.add('active');
      });
    });
  });
}

/**
 * Show a specific section and hide others
 */
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // Load data for the section if needed
    switch (sectionId) {
      case 'ec2':
        loadEC2Instances();
        break;
      case 's3':
        loadS3Buckets();
        break;
      case 'rds':
        loadRDSInstances();
        break;
      case 'lambda':
        loadLambdaFunctions();
        break;
      case 'iam':
        loadIAMUsers();
        break;
    }
  }
}

/**
 * Set up event listeners for buttons and forms
 */
function setupEventListeners() {
  // Region selector
  const regionSelector = document.getElementById('region-selector');
  regionSelector.addEventListener('change', function() {
    currentRegion = this.value;
    // Reload data for the current section
    const activeSection = document.querySelector('.section.active');
    if (activeSection) {
      showSection(activeSection.id);
    }
  });
  
  // Refresh buttons
  document.getElementById('refresh-ec2').addEventListener('click', loadEC2Instances);
  document.getElementById('refresh-s3').addEventListener('click', loadS3Buckets);
  document.getElementById('refresh-rds').addEventListener('click', loadRDSInstances);
  document.getElementById('refresh-lambda').addEventListener('click', loadLambdaFunctions);
  document.getElementById('refresh-iam').addEventListener('click', loadIAMUsers);
  
  // Create bucket button
  document.getElementById('create-bucket').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('create-bucket-modal'));
    modal.show();
  });
  
  // Create bucket form submission
  document.getElementById('create-bucket-submit').addEventListener('click', createS3Bucket);
  
  // Invoke Lambda form submission
  document.getElementById('invoke-lambda-submit').addEventListener('click', invokeLambdaFunction);
}

/**
 * Load AWS regions
 */
function loadRegions() {
  fetch('/api/aws/regions')
    .then(response => response.json())
    .then(data => {
      const regionSelector = document.getElementById('region-selector');
      const bucketRegionSelector = document.getElementById('bucket-region');
      
      // Clear existing options
      regionSelector.innerHTML = '<option value="" disabled selected>Select Region</option>';
      bucketRegionSelector.innerHTML = '';
      
      // Add regions to selectors
      data.regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.code;
        option.textContent = `${region.name} (${region.code})`;
        regionSelector.appendChild(option.cloneNode(true));
        bucketRegionSelector.appendChild(option);
      });
      
      // Set default region if available in .env
      const defaultRegion = 'us-east-1'; // This should match your .env default
      if (defaultRegion) {
        regionSelector.value = defaultRegion;
        bucketRegionSelector.value = defaultRegion;
        currentRegion = defaultRegion;
      }
    })
    .catch(error => {
      console.error('Error loading regions:', error);
      showError('Failed to load AWS regions. Please check your connection and AWS credentials.');
    });
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
  // Load counts for each service
  loadEC2Count();
  loadS3Count();
  loadRDSCount();
  loadLambdaCount();
  loadIAMCount();
}

/**
 * Load EC2 instance count
 */
function loadEC2Count() {
  fetch('/api/aws/ec2/instances')
    .then(response => response.json())
    .then(data => {
      document.getElementById('ec2-count').textContent = data.instances.length;
    })
    .catch(error => {
      console.error('Error loading EC2 count:', error);
      document.getElementById('ec2-count').textContent = '-';
    });
}

/**
 * Load S3 bucket count
 */
function loadS3Count() {
  fetch('/api/aws/s3/buckets')
    .then(response => response.json())
    .then(data => {
      document.getElementById('s3-count').textContent = data.buckets.length;
    })
    .catch(error => {
      console.error('Error loading S3 count:', error);
      document.getElementById('s3-count').textContent = '-';
    });
}

/**
 * Load RDS instance count
 */
function loadRDSCount() {
  fetch('/api/aws/rds/instances')
    .then(response => response.json())
    .then(data => {
      document.getElementById('rds-count').textContent = data.instances.length;
    })
    .catch(error => {
      console.error('Error loading RDS count:', error);
      document.getElementById('rds-count').textContent = '-';
    });
}

/**
 * Load Lambda function count
 */
function loadLambdaCount() {
  fetch('/api/aws/lambda/functions')
    .then(response => response.json())
    .then(data => {
      document.getElementById('lambda-count').textContent = data.functions.length;
    })
    .catch(error => {
      console.error('Error loading Lambda count:', error);
      document.getElementById('lambda-count').textContent = '-';
    });
}

/**
 * Load IAM user count
 */
function loadIAMCount() {
  fetch('/api/aws/iam/users')
    .then(response => response.json())
    .then(data => {
      document.getElementById('iam-count').textContent = data.users.length;
    })
    .catch(error => {
      console.error('Error loading IAM count:', error);
      document.getElementById('iam-count').textContent = '-';
    });
}

/**
 * Load EC2 instances
 */
function loadEC2Instances() {
  const tableBody = document.getElementById('ec2-instances');
  tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading instances...</td></tr>';
  
  fetch('/api/aws/ec2/instances')
    .then(response => response.json())
    .then(data => {
      if (data.instances.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No instances found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      
      data.instances.forEach(instance => {
        const row = document.createElement('tr');
        
        // Status indicator class
        let statusClass = '';
        switch (instance.state) {
          case 'running':
            statusClass = 'status-running';
            break;
          case 'stopped':
            statusClass = 'status-stopped';
            break;
          default:
            statusClass = 'status-pending';
        }
        
        row.innerHTML = `
          <td>${instance.name || '-'}</td>
          <td>${instance.id}</td>
          <td>${instance.type}</td>
          <td><span class="status-indicator ${statusClass}"></span>${instance.state}</td>
          <td>${instance.publicIp || '-'}</td>
          <td>${instance.privateIp || '-'}</td>
          <td>
            <div class="btn-group btn-group-sm">
              ${instance.state === 'stopped' ? 
                `<button class="btn btn-outline-success action-btn" data-action="start" data-id="${instance.id}">Start</button>` : 
                ''}
              ${instance.state === 'running' ? 
                `<button class="btn btn-outline-warning action-btn" data-action="stop" data-id="${instance.id}">Stop</button>` : 
                ''}
              ${instance.state === 'running' ? 
                `<button class="btn btn-outline-primary action-btn" data-action="reboot" data-id="${instance.id}">Reboot</button>` : 
                ''}
              <button class="btn btn-outline-danger action-btn" data-action="terminate" data-id="${instance.id}">Terminate</button>
            </div>
          </td>
        `;
        
        // Add event listeners for action buttons
        const actionButtons = row.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
          button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const instanceId = this.getAttribute('data-id');
            
            performEC2Action(action, instanceId);
          });
        });
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading EC2 instances:', error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading instances: ${error.message}</td></tr>`;
    });
}

/**
 * Perform an action on an EC2 instance
 */
function performEC2Action(action, instanceId) {
  const actionMap = {
    start: 'starting',
    stop: 'stopping',
    reboot: 'rebooting',
    terminate: 'terminating'
  };
  
  if (!confirm(`Are you sure you want to ${action} instance ${instanceId}?`)) {
    return;
  }
  
  fetch(`/api/aws/ec2/instances/${instanceId}/${action}`, {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      showSuccess(`Instance ${instanceId} is ${actionMap[action]}`);
      // Reload instances after a short delay
      setTimeout(loadEC2Instances, 2000);
    })
    .catch(error => {
      console.error(`Error ${action} instance:`, error);
      showError(`Failed to ${action} instance: ${error.message}`);
    });
}

/**
 * Load S3 buckets
 */
function loadS3Buckets() {
  const tableBody = document.getElementById('s3-buckets');
  tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Loading buckets...</td></tr>';
  
  fetch('/api/aws/s3/buckets')
    .then(response => response.json())
    .then(data => {
      if (data.buckets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No buckets found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      
      data.buckets.forEach(bucket => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${bucket.name}</td>
          <td>${new Date(bucket.creationDate).toLocaleString()}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary action-btn" data-action="view-objects" data-bucket="${bucket.name}">View Objects</button>
              <button class="btn btn-outline-danger action-btn" data-action="delete-bucket" data-bucket="${bucket.name}">Delete</button>
            </div>
          </td>
        `;
        
        // Add event listeners for action buttons
        const actionButtons = row.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
          button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const bucketName = this.getAttribute('data-bucket');
            
            if (action === 'view-objects') {
              // TODO: Implement view objects functionality
              alert(`View objects in ${bucketName} - Not implemented in this demo`);
            } else if (action === 'delete-bucket') {
              deleteS3Bucket(bucketName);
            }
          });
        });
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading S3 buckets:', error);
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error loading buckets: ${error.message}</td></tr>`;
    });
}

/**
 * Create a new S3 bucket
 */
function createS3Bucket() {
  const bucketName = document.getElementById('bucket-name').value;
  const region = document.getElementById('bucket-region').value;
  
  if (!bucketName) {
    showError('Bucket name is required');
    return;
  }
  
  fetch('/api/aws/s3/buckets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketName,
      region
    })
  })
    .then(response => response.json())
    .then(data => {
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('create-bucket-modal'));
      modal.hide();
      
      // Clear the form
      document.getElementById('bucket-name').value = '';
      
      showSuccess(`Bucket ${bucketName} created successfully`);
      
      // Reload buckets
      loadS3Buckets();
      loadS3Count();
    })
    .catch(error => {
      console.error('Error creating bucket:', error);
      showError(`Failed to create bucket: ${error.message}`);
    });
}

/**
 * Delete an S3 bucket
 */
function deleteS3Bucket(bucketName) {
  if (!confirm(`Are you sure you want to delete bucket ${bucketName}? This action cannot be undone.`)) {
    return;
  }
  
  fetch(`/api/aws/s3/buckets/${bucketName}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      showSuccess(`Bucket ${bucketName} deleted successfully`);
      
      // Reload buckets
      loadS3Buckets();
      loadS3Count();
    })
    .catch(error => {
      console.error('Error deleting bucket:', error);
      showError(`Failed to delete bucket: ${error.message}`);
    });
}

/**
 * Load RDS instances
 */
function loadRDSInstances() {
  const tableBody = document.getElementById('rds-instances');
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading instances...</td></tr>';
  
  fetch('/api/aws/rds/instances')
    .then(response => response.json())
    .then(data => {
      if (data.instances.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No instances found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      
      data.instances.forEach(instance => {
        const row = document.createElement('tr');
        
        // Status indicator class
        let statusClass = '';
        switch (instance.status) {
          case 'available':
            statusClass = 'status-running';
            break;
          case 'stopped':
            statusClass = 'status-stopped';
            break;
          default:
            statusClass = 'status-pending';
        }
        
        row.innerHTML = `
          <td>${instance.identifier}</td>
          <td>${instance.engine} ${instance.engineVersion}</td>
          <td><span class="status-indicator ${statusClass}"></span>${instance.status}</td>
          <td>${instance.endpoint || '-'}</td>
          <td>${instance.instanceClass}</td>
          <td>
            <div class="btn-group btn-group-sm">
              ${instance.status === 'stopped' ? 
                `<button class="btn btn-outline-success action-btn" data-action="start" data-id="${instance.identifier}">Start</button>` : 
                ''}
              ${instance.status === 'available' ? 
                `<button class="btn btn-outline-warning action-btn" data-action="stop" data-id="${instance.identifier}">Stop</button>` : 
                ''}
            </div>
          </td>
        `;
        
        // Add event listeners for action buttons
        const actionButtons = row.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
          button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const instanceId = this.getAttribute('data-id');
            
            performRDSAction(action, instanceId);
          });
        });
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading RDS instances:', error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading instances: ${error.message}</td></tr>`;
    });
}

/**
 * Perform an action on an RDS instance
 */
function performRDSAction(action, instanceId) {
  const actionMap = {
    start: 'starting',
    stop: 'stopping'
  };
  
  if (!confirm(`Are you sure you want to ${action} database instance ${instanceId}?`)) {
    return;
  }
  
  fetch(`/api/aws/rds/instances/${instanceId}/${action}`, {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      showSuccess(`Database instance ${instanceId} is ${actionMap[action]}`);
      // Reload instances after a short delay
      setTimeout(loadRDSInstances, 2000);
    })
    .catch(error => {
      console.error(`Error ${action} database instance:`, error);
      showError(`Failed to ${action} database instance: ${error.message}`);
    });
}

/**
 * Load Lambda functions
 */
function loadLambdaFunctions() {
  const tableBody = document.getElementById('lambda-functions');
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading functions...</td></tr>';
  
  fetch('/api/aws/lambda/functions')
    .then(response => response.json())
    .then(data => {
      if (data.functions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No functions found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      
      data.functions.forEach(func => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${func.name}</td>
          <td>${func.runtime}</td>
          <td>${func.memory} MB</td>
          <td>${func.timeout} sec</td>
          <td>${new Date(func.lastModified).toLocaleString()}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary action-btn" data-action="invoke" data-function="${func.name}">Invoke</button>
            </div>
          </td>
        `;
        
        // Add event listeners for action buttons
        const actionButtons = row.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
          button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const functionName = this.getAttribute('data-function');
            
            if (action === 'invoke') {
              showInvokeLambdaModal(functionName);
            }
          });
        });
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error loading Lambda functions:', error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading functions: ${error.message}</td></tr>`;
    });
}

/**
 * Show the invoke Lambda modal
 */
function showInvokeLambdaModal(functionName) {
  document.getElementById('lambda-function-name').value = functionName;
  document.getElementById('lambda-payload').value = '{}';
  document.getElementById('invocation-type').value = 'RequestResponse';
  
  const modal = new bootstrap.Modal(document.getElementById('invoke-lambda-modal'));
  modal.show();
}

/**
 * Invoke a Lambda function
 */
function invokeLambdaFunction() {
  const functionName = document.getElementById('lambda-function-name').value;
  let payload;
  
  try {
    payload = JSON.parse(document.getElementById('lambda-payload').value);
  } catch (error) {
    showError('Invalid JSON payload');
    return;
  }
  
  const invocationType = document.getElementById('invocation-type').value;
  
  fetch(`/api/aws/lambda/functions/${functionName}/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payload,
      invocationType
    })
  })
    .then(response => response.json())
    .then(data => {
      // Close the invoke modal
      const invokeModal = bootstrap.Modal.getInstance(document.getElementById('invoke-lambda-modal'));
      invokeModal.hide();
      
      // Show the response modal
      document.getElementById('lambda-response').textContent = JSON.stringify(data, null, 2);
      const responseModal = new bootstrap.Modal(document.getElementById('lambda-response-modal'));
      responseModal.show();
    })
    .catch(error => {
      console.error('Error invoking function:', error);
      showError(`Failed to invoke function: ${error.message}`);
    });
}

/**
 * Load IAM users
 */
function loadIAMUsers() {
  const usersTableBody = document.getElementById('iam-users');
  usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading users...</td></tr>';
  
  fetch('/api/aws/iam/users')
    .then(response => response.json())
    .then(data => {
      if (data.users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
      } else {
        usersTableBody.innerHTML = '';
        
        data.users.forEach(user => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.id}</td>
            <td>${user.arn}</td>
            <td>${new Date(user.createdDate).toLocaleString()}</td>
          `;
          
          usersTableBody.appendChild(row);
        });
      }
    })
    .catch(error => {
      console.error('Error loading IAM users:', error);
      usersTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading users: ${error.message}</td></tr>`;
    });
  
  // Also load roles and policies
  loadIAMRoles();
  loadIAMPolicies();
}

/**
 * Load IAM roles
 */
function loadIAMRoles() {
  const rolesTableBody = document.getElementById('iam-roles');
  rolesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading roles...</td></tr>';
  
  fetch('/api/aws/iam/roles')
    .then(response => response.json())
    .then(data => {
      if (data.roles.length === 0) {
        rolesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No roles found</td></tr>';
      } else {
        rolesTableBody.innerHTML = '';
        
        data.roles.forEach(role => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${role.name}</td>
            <td>${role.id}</td>
            <td>${role.arn}</td>
            <td>${new Date(role.createdDate).toLocaleString()}</td>
          `;
          
          rolesTableBody.appendChild(row);
        });
      }
    })
    .catch(error => {
      console.error('Error loading IAM roles:', error);
      rolesTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading roles: ${error.message}</td></tr>`;
    });
}

/**
 * Load IAM policies
 */
function loadIAMPolicies() {
  const policiesTableBody = document.getElementById('iam-policies');
  policiesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading policies...</td></tr>';
  
  fetch('/api/aws/iam/policies')
    .then(response => response.json())
    .then(data => {
      if (data.policies.length === 0) {
        policiesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No policies found</td></tr>';
      } else {
        policiesTableBody.innerHTML = '';
        
        data.policies.forEach(policy => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${policy.name}</td>
            <td>${policy.id}</td>
            <td>${policy.arn}</td>
            <td>${policy.attachmentCount}</td>
          `;
          
          policiesTableBody.appendChild(row);
        });
      }
    })
    .catch(error => {
      console.error('Error loading IAM policies:', error);
      policiesTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading policies: ${error.message}</td></tr>`;
    });
}

/**
 * Show a success message
 */
function showSuccess(message) {
  // You can implement a toast or alert system here
  alert(message);
}

/**
 * Show an error message
 */
function showError(message) {
  // You can implement a toast or alert system here
  alert(`Error: ${message}`);
}
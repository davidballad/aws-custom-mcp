# AWS Management Control Plane (MCP) Server

A server application that provides a management control plane for AWS resources. This application allows you to monitor and manage your AWS resources through a simple web interface.

## Features

- AWS resource discovery and monitoring
- Resource management capabilities (start, stop, terminate, etc.)
- Simple web interface for easy interaction
- RESTful API for programmatic access

## Prerequisites

- Node.js (v14 or higher)
- AWS account with appropriate permissions
- AWS credentials configured

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   AWS_REGION=your-aws-region
   PORT=3000
   ```

## Configuration

Make sure you have AWS credentials configured. You can do this in several ways:

1. Using the AWS CLI: `aws configure`
2. Setting environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. Using an AWS credentials file (`~/.aws/credentials`)

## Usage

### Starting the server

```
npm start
```

For development with auto-restart:

```
npm run dev
```

The server will start on the port specified in your `.env` file (default: 3000).

### Accessing the web interface

Open your browser and navigate to `http://localhost:3000`

### Using the API

The API documentation is available at `http://localhost:3000/api-docs`

## License

MIT
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const awsRoutes = require('./routes/aws');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Routes
app.use('/api/aws', awsRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// Start server
app.listen(PORT, () => {
  console.log(`AWS MCP Server running on port ${PORT}`);
});
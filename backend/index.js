require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Route files
const eventRoutes = require('./routes/eventRoutes');
const chatbotRoutes = require('./routes/chatbot');
const { startCronJobs } = require('./services/cronService');

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'NexusEvents API is running' });
});

// Mount routers
app.use('/api/events', eventRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Start Background Cron Jobs
startCronJobs();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
